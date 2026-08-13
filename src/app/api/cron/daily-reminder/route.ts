import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, push_subscription, streak_days')
    .not('push_subscription', 'is', null)

  let sentCount = 0

  for (const user of users || []) {
    const { count } = await supabase
      .from('completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed_date', today)

    if ((count || 0) === 0) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://life-rpg-os.com'
      await fetch(`${appUrl}/api/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title:
            user.streak_days > 0
              ? `🔥 Don't break your ${user.streak_days}-day streak!`
              : '⚔️ Your quests are waiting, adventurer!',
          body: 'Complete your daily quests to earn XP and level up.',
          url: '/quests',
        }),
      })
      sentCount++
    }
  }

  return NextResponse.json({ success: true, sent: sentCount })
}
