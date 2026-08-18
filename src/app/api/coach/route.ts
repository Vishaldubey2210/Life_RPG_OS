import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { COACH_SYSTEM_PROMPT, buildUserContext, CoachMemoryItem } from '@/lib/coach'

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

    // Parallel fetch profile, stats, habits, completions, memories, and past conversations
    const [
      { data: profile },
      { data: stats },
      { data: habits },
      { data: completions },
      { data: memoriesData },
      { data: pastConversations },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('stats').select('*').eq('user_id', user.id).single(),
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', weekAgoStr + 'T00:00:00'),
      supabase
        .from('coach_memory')
        .select('id, memory_type, content, importance')
        .eq('user_id', user.id)
        .order('importance', { ascending: false })
        .limit(10),
      supabase
        .from('coach_conversations')
        .select('role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    // Save latest user message into coach_conversations
    const latestUserMsg = messages[messages.length - 1]
    if (latestUserMsg && latestUserMsg.role === 'user') {
      await supabase.from('coach_conversations').insert({
        user_id: user.id,
        role: 'user',
        content: latestUserMsg.content,
      })
    }

    const memories = (memoriesData ?? []) as CoachMemoryItem[]
    const userContext = buildUserContext(
      profile ?? { display_name: 'Adventurer', level: 1 },
      stats ?? {},
      habits ?? [],
      completions ?? [],
      memories
    )

    const systemWithContext = COACH_SYSTEM_PROMPT + '\n\n' + userContext

    // Combine recent past history from db if available
    const recentHistory = (pastConversations ?? []).reverse().map((c) => ({
      role: c.role as 'user' | 'assistant',
      content: c.content,
    }))

    const combinedMessages = recentHistory.length > 0 && messages.length <= 2
      ? [...recentHistory, ...messages.filter((m) => !recentHistory.some((rh) => rh.content === m.content))]
      : messages

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemWithContext },
        ...combinedMessages,
      ],
      stream: true,
    })

    let completeAssistantReply = ''
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            completeAssistantReply += content
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()

        // Save assistant reply and check if we should trigger memory extraction
        if (completeAssistantReply) {
          await supabase.from('coach_conversations').insert({
            user_id: user.id,
            role: 'assistant',
            content: completeAssistantReply,
          })

          const { count } = await supabase
            .from('coach_conversations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (count && count % 5 === 0) {
            // Trigger background memory extraction
            try {
              fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/coach/extract-memory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: combinedMessages }),
              }).catch(() => {})
            } catch {
              // Ignore async trigger errors
            }
          }
        }
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
