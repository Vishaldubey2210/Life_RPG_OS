import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [profileRes, statsRes, habitsRes, completionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('stats').select('*').eq('user_id', user.id).single(),
      supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('habit_completions').select('xp_earned, completed_at, habits(name,stat_category)').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(50),
    ])

    const profile = profileRes.data
    const stats = statsRes.data
    const habits = habitsRes.data ?? []
    const completions = completionsRes.data ?? []

    const totalCompletions = completions.length
    const last7Days = completions.filter(c => {
      const date = new Date(c.completed_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    })

    const context = `
Player Profile:
- Level: ${profile?.level ?? 1}
- Total XP: ${profile?.xp ?? 0}
- Current Streak: ${profile?.streak ?? 0} days
- HP: ${profile?.hp ?? 100}/${profile?.hp_max ?? 100}

Stats: STR=${stats?.str ?? 0} INT=${stats?.int ?? 0} WIS=${stats?.wis ?? 0} VIT=${stats?.vit ?? 0} GOLD=${stats?.gold ?? 0} CHA=${stats?.cha ?? 0}

Active quests: ${habits.length} quests
Total completions: ${totalCompletions}
Completions last 7 days: ${last7Days.length}

Top quest categories: ${habits.map((h: { stat_category: string }) => h.stat_category).join(', ')}
    `.trim()

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `${context}

Analyze this Life RPG OS player's data and give exactly 3 insights.
Format as JSON array ONLY (no markdown, no explanation):
[
  {
    "type": "strength",
    "title": "Short insight title",
    "body": "2-3 sentence explanation with specific numbers from their data",
    "action": "One specific actionable thing to do today"
  },
  {
    "type": "warning",
    "title": "...",
    "body": "...",
    "action": "..."
  },
  {
    "type": "opportunity",
    "title": "...",
    "body": "...",
    "action": "..."
  }
]`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'

    // Extract JSON from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return NextResponse.json([])

    const insights = JSON.parse(jsonMatch[0])
    return NextResponse.json(insights)
  } catch (err) {
    console.error('Analytics insights error:', err)
    return NextResponse.json([])
  }
}
