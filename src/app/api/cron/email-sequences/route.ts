import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { day3NudgeEmail, day7ReportEmail, day30ComebackEmail } from '@/lib/emails/sequences'

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
  const results = { day3: 0, day7: 0, day30: 0 }
  const now = new Date()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, display_name, level, streak, streak_days, xp, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  for (const user of users ?? []) {
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id)
    const email = authUser?.user?.email
    if (!email) continue

    const createdAt = new Date(user.created_at)
    const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / 86400000)
    const streak = user.streak_days ?? user.streak ?? 0
    const level = user.level ?? 1
    const xp = user.xp ?? 0

    // --- Day 3 nudge: signed up 3 days ago, no completions yet ---
    if (daysSinceSignup === 3) {
      const { count } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if ((count ?? 0) === 0) {
        await sendEmail({
          to: email,
          subject: `⚠️ Your streak hasn't started yet, ${user.display_name}`,
          html: day3NudgeEmail(user.display_name ?? 'Adventurer'),
        })
        results.day3++
      }
    }

    // --- Day 7 report: send weekly report ---
    if (daysSinceSignup === 7 || daysSinceSignup % 7 === 0) {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)

      const { count: weeklyCompletions } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('completed_at', weekAgo.toISOString())

      const { data: weekStats } = await supabase
        .from('habit_completions')
        .select('xp_earned')
        .eq('user_id', user.id)
        .gte('completed_at', weekAgo.toISOString())

      const weeklyXP = weekStats?.reduce((sum, c) => sum + (c.xp_earned ?? 0), 0) ?? 0

      await sendEmail({
        to: email,
        subject: `⚡ Your Week ${Math.floor(daysSinceSignup / 7)} RPG Report, ${user.display_name}`,
        html: day7ReportEmail(user.display_name ?? 'Adventurer', {
          questsCompleted: weeklyCompletions ?? 0,
          xpEarned: weeklyXP,
          level,
          streak,
        }),
      })
      results.day7++
    }

    // --- Day 30 comeback: inactive 7+ days, signed up 30+ days ago ---
    if (daysSinceSignup >= 30) {
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(now.getDate() - 7)

      const { count: recentActivity } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgo.toISOString())

      if ((recentActivity ?? 0) === 0) {
        await sendEmail({
          to: email,
          subject: `👑 ${user.display_name}, your adventure awaits`,
          html: day30ComebackEmail(user.display_name ?? 'Adventurer', level, xp),
        })
        results.day30++
      }
    }
  }

  return NextResponse.json({ success: true, results })
}
