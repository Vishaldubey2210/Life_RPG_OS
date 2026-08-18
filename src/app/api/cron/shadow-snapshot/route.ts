import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function startOfWeek(date: Date) {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = result.getUTCDay() || 7
  result.setUTCDate(result.getUTCDate() - day + 1)
  return result
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase service configuration is missing' }, { status: 500 })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const thisWeek = startOfWeek(new Date())
  const weekStart = new Date(thisWeek)
  weekStart.setUTCDate(weekStart.getUTCDate() - 7)
  const weekEnd = new Date(thisWeek)

  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id')
  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 })

  const { data: completions, error: completionsError } = await supabase
    .from('habit_completions')
    .select('user_id, completed_at, xp_earned')
    .gte('completed_at', weekStart.toISOString())
    .lt('completed_at', weekEnd.toISOString())
  if (completionsError) return NextResponse.json({ error: completionsError.message }, { status: 500 })

  const byUser = new Map<string, { daily: Record<string, number>; xp: number }>()
  for (const completion of completions ?? []) {
    const item = byUser.get(completion.user_id) ?? { daily: {}, xp: 0 }
    const date = completion.completed_at.slice(0, 10)
    item.daily[date] = (item.daily[date] ?? 0) + 1
    item.xp += completion.xp_earned ?? 0
    byUser.set(completion.user_id, item)
  }

  const rows = (profiles ?? []).map(({ id }) => {
    const data = byUser.get(id) ?? { daily: {}, xp: 0 }
    return { user_id: id, week_start: weekStart.toISOString().slice(0, 10), daily_completions: data.daily, total_xp: data.xp }
  })
  const { error: upsertError } = await supabase.from('shadow_data').upsert(rows, { onConflict: 'user_id,week_start' })
  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  return NextResponse.json({ success: true, weekStart: weekStart.toISOString().slice(0, 10), snapshots: rows.length })
}
