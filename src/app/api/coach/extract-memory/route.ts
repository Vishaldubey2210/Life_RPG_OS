import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface ExtractedMemory {
  memory_type: 'pattern' | 'preference' | 'goal' | 'struggle' | 'milestone' | 'personality' | 'insight'
  content: string
  importance: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages } = (await request.json()) as {
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    // If messages not directly provided, fetch the last 10 from database
    let conversationToAnalyze = messages
    if (!conversationToAnalyze || conversationToAnalyze.length === 0) {
      const { data: convs } = await supabase
        .from('coach_conversations')
        .select('role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      conversationToAnalyze = (convs ?? []).reverse() as Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!conversationToAnalyze || conversationToAnalyze.length < 2) {
      return NextResponse.json({ extracted: 0 })
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const prompt = `
Analyze this conversation between a user and their Life RPG AI Coach. Extract valuable long-term memories worth saving to better coach this player in future sessions.

Focus strictly on:
- Patterns (e.g. "User consistently skips habits on Mondays")
- Struggles (e.g. "User finds meditation hard to start due to anxiety")
- Goals (e.g. "User wants to hit 75kg and master coding by December")
- Personality (e.g. "User responds best to direct challenge and tough love")
- Milestones (e.g. "User achieved a 30-day streak on morning workout")
- Preferences (e.g. "User prefers morning sessions before 8 AM")

Conversation transcript:
${conversationToAnalyze.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Return a valid JSON array of objects with NO markdown formatting, backticks, or other text:
[
  {
    "memory_type": "pattern|preference|goal|struggle|milestone|personality|insight",
    "content": "One concise, factual sentence describing the memory",
    "importance": 1-10
  }
]
Max 3 high-value memories. If nothing noteworthy is found, return []
`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 500,
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]'
    const cleaned = raw.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim()

    let memories: ExtractedMemory[] = []
    try {
      memories = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('Failed to parse memory JSON:', cleaned, parseErr)
      return NextResponse.json({ extracted: 0 })
    }

    if (!Array.isArray(memories) || memories.length === 0) {
      return NextResponse.json({ extracted: 0 })
    }

    const rowsToInsert = memories.slice(0, 3).map((m) => ({
      user_id: user.id,
      memory_type: m.memory_type ?? 'insight',
      content: m.content,
      importance: Math.min(Math.max(Number(m.importance) || 5, 1), 10),
    }))

    const { error: insertError } = await supabase.from('coach_memory').insert(rowsToInsert)
    if (insertError) {
      console.error('Error inserting coach memories:', insertError)
    }

    return NextResponse.json({ extracted: rowsToInsert.length, memories: rowsToInsert })
  } catch (error) {
    console.error('Extract memory error:', error)
    return NextResponse.json({ error: 'Failed to extract memory' }, { status: 500 })
  }
}
