import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, level, streak, streak_days, push_subscription')
    .not('push_subscription', 'is', null)

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  let sentCount = 0

  for (const user of users || []) {
    // Check if user already completed quests today
    const { count } = await supabase
      .from('habit_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('completed_at', `${today}T00:00:00`)

    if ((count || 0) === 0) {
      const streak = user.streak_days ?? user.streak ?? 0
      let briefing = `Rise and shine, Level ${user.level} warrior! Your daily quests await. Earn your XP and keep your streak alive!`

      try {
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Generate a 3-line morning quest briefing for player ${user.display_name} (Level ${user.level}, ${streak}-day streak).
Format:
Line 1: Motivational opener referencing level/streak
Line 2: Today's most important focus
Line 3: One sentence challenge
Keep under 40 words total. RPG tone. No emojis in excess.`,
            },
          ],
          max_tokens: 100,
        })
        const text = response.choices[0]?.message?.content?.trim()
        if (text) briefing = text
      } catch {
        // Fallback default briefing
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://life-rpg-os.com'
      try {
        await fetch(`${appUrl}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            title: `⚔️ Morning Quest Briefing — Level ${user.level}`,
            body: briefing,
            url: '/dashboard',
          }),
        })
        sentCount++
      } catch (err) {
        console.error('Error sending morning nudge:', err)
      }
    }
  }

  return NextResponse.json({ success: true, nudgesSent: sentCount })
}
