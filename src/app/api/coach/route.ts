import Anthropic from '@anthropic-ai/sdk'
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

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemWithContext,
      messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
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
