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
    // Check pending habits
    const [{ count: totalHabits }, { count: completedToday }] = await Promise.all([
      supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
      supabase.from('habit_completions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('completed_at', `${today}T00:00:00`),
    ])

    const total = totalHabits || 0
    const done = completedToday || 0
    const remaining = total - done

    if (remaining > 0) {
      const streak = user.streak_days ?? user.streak ?? 0
      let nudgeBody = `You have ${remaining} incomplete quests! Complete them now to protect your ${streak}-day streak.`

      try {
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `User has ${remaining} quests left today. Their ${streak}-day streak is at stake.
Write a 2-line notification creating urgency without being annoying.
Reference the ${streak}-day streak specifically. Under 25 words total.`,
            },
          ],
          max_tokens: 60,
        })
        const text = response.choices[0]?.message?.content?.trim()
        if (text) nudgeBody = text
      } catch {
        // Fallback default
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://life-rpg-os.com'
      try {
        await fetch(`${appUrl}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            title: streak > 0 ? `🔥 Streak Alert: ${streak} Days on the Line!` : `⚔️ Night Raid: ${remaining} Quests Left`,
            body: nudgeBody,
            url: '/quests',
          }),
        })
        sentCount++
      } catch (err) {
        console.error('Error sending evening nudge:', err)
      }
    }
  }

  return NextResponse.json({ success: true, eveningNudgesSent: sentCount })
}
