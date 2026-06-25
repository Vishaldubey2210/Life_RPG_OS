import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { buildUserContext } from '@/lib/coach'

const WEEKLY_REPORT_PROMPT = `Generate a detailed Weekly RPG Report for this player.
Format it with these sections:
1. ⚔️ BATTLE SUMMARY — Overall performance this week
2. 📊 STAT CHANGES — Which stats grew, which didn't
3. 🏆 WINS — What they did great
4. ⚠️ WEAK POINTS — Where they struggled (be honest)
5. 🎯 NEXT WEEK MISSION — 3 specific goals for next 7 days
6. 💬 COACH'S MESSAGE — Personal motivational note

Use RPG language. Reference their actual numbers. Be specific.
Format each section with the emoji + section name as a header, followed by the content.
Keep each section 2-3 sentences. Be direct and honest.`

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const message = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: userContext },
        { role: 'user', content: WEEKLY_REPORT_PROMPT }
      ],
    })

    const reportText = message.choices[0]?.message?.content || ''

    return NextResponse.json({ report: reportText })
  } catch (error) {
    console.error('Weekly report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
