import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { COACH_SYSTEM_PROMPT, buildUserContext } from '@/lib/coach'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages } = (await request.json()) as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    const [{ data: profile }, { data: stats }, { data: habits }, { data: completions }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('stats').select('*').eq('user_id', user.id).single(),
        supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase
          .from('habit_completions')
          .select('*')
          .eq('user_id', user.id)
          .gte('completed_at', weekAgoStr + 'T00:00:00'),
      ])

    const userContext = buildUserContext(
      profile ?? { display_name: 'Adventurer', level: 1 },
      stats ?? {},
      habits ?? [],
      completions ?? []
    )
    const systemWithContext = COACH_SYSTEM_PROMPT + '\n\n' + userContext

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemWithContext },
        ...messages,
      ],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  } catch (error) {
    console.error('Coach API error:', error)
    return NextResponse.json({ error: 'Coach unavailable' }, { status: 500 })
  }
}
