'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Crown, Swords, TrendingDown, TrendingUp } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/useProfile'

type Snapshot = { daily_completions: Record<string, number>; total_xp: number; week_start: string }

function monday(date: Date) {
  const result = new Date(date)
  const day = result.getDay() || 7
  result.setDate(result.getDate() - day + 1)
  result.setHours(0, 0, 0, 0)
  return result
}

export default function ShadowPage() {
  const { profile } = useProfile()
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [today, setToday] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const weekStart = useMemo(() => monday(new Date()), [])
  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(date.getDate() + index); return date }), [weekStart])

  useEffect(() => {
    async function load() {
      if (!profile?.id || !supabase) return
      setLoading(true)
      const previousWeek = new Date(weekStart)
      previousWeek.setDate(previousWeek.getDate() - 7)
      const [snapshotResult, completionResult] = await Promise.all([
        supabase.from('shadow_data').select('daily_completions, total_xp, week_start').eq('user_id', profile.id).eq('week_start', previousWeek.toISOString().slice(0, 10)).maybeSingle(),
        supabase.from('habit_completions').select('completed_at, xp_earned').eq('user_id', profile.id).gte('completed_at', weekStart.toISOString()),
      ])
      if (snapshotResult.data) setSnapshot(snapshotResult.data as Snapshot)
      const current: Record<string, number> = {}
      for (const completion of completionResult.data ?? []) {
        const date = completion.completed_at.slice(0, 10)
        current[date] = (current[date] ?? 0) + 1
      }
      setToday(current)
      setLoading(false)
    }
    void load()
  }, [profile?.id, supabase, weekStart])

  const currentTotal = Object.values(today).reduce((sum, count) => sum + count, 0)
  const shadowTotal = Object.values(snapshot?.daily_completions ?? {}).reduce((sum, count) => sum + count, 0)
  const delta = currentTotal - shadowTotal

  return <div className="flex min-h-screen bg-[#08080F]"><Sidebar /><main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:ml-60 md:p-8">
    <div className="mb-8"><div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 font-display"><Swords size={14} /> Weekly Rivalry</div><h1 className="text-3xl font-extrabold text-white font-display">Shadow Clone</h1><p className="mt-2 text-sm text-slate-400">Race against the adventurer you were last week.</p></div>
    {loading ? <div className="rounded-2xl border border-slate-800 bg-[#13131F] p-10 text-center text-sm text-slate-400">Summoning your shadow…</div> : !snapshot ? <div className="rounded-2xl border border-purple-500/20 bg-[#13131F] p-10 text-center"><BarChart3 className="mx-auto mb-3 text-purple-400" size={32} /><h2 className="font-bold text-white font-display">Your shadow is forming</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-400">Complete this week’s quests. Your first comparison unlocks after the Sunday snapshot.</p></div> : <>
      <section className="mb-6 grid gap-4 md:grid-cols-3"><ScoreCard label="You this week" value={`${currentTotal} quests`} color="text-green-400" /><ScoreCard label="Shadow last week" value={`${shadowTotal} quests`} color="text-purple-400" /><ScoreCard label={delta >= 0 ? 'You are ahead' : 'Shadow leads'} value={`${delta >= 0 ? '+' : ''}${delta} quests`} color={delta >= 0 ? 'text-amber-400' : 'text-red-400'} /></section>
      <section className="rounded-2xl border border-slate-800 bg-[#13131F] p-5"><h2 className="mb-6 flex items-center gap-2 text-sm font-bold text-white font-display"><Crown size={16} className="text-amber-400" /> Daily battle</h2><div className="grid grid-cols-7 gap-2">{dates.map((date) => { const key = date.toISOString().slice(0, 10); const shadowKey = new Date(date.getTime() - 7 * 86400000).toISOString().slice(0, 10); const current = today[key] ?? 0; const past = snapshot.daily_completions[shadowKey] ?? 0; const won = current >= past; return <div key={key} className="rounded-xl bg-[#0F0F1A] p-2 text-center"><div className="text-[10px] text-slate-500">{date.toLocaleDateString(undefined, { weekday: 'short' })}</div><div className={`mt-2 text-lg font-black font-display ${won ? 'text-green-400' : 'text-purple-400'}`}>{current}</div><div className="text-[10px] text-slate-500">vs {past}</div></div> })}</div></section>
      <p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-400">{delta >= 0 ? <TrendingUp className="text-green-400" size={16} /> : <TrendingDown className="text-red-400" size={16} />}{delta >= 0 ? 'Keep the lead—every completed quest widens the gap.' : 'One quest at a time. Your shadow can still be defeated.'}</p>
    </>}
  </main></div>
}

function ScoreCard({ label, value, color }: { label: string; value: string; color: string }) { return <div className="rounded-2xl border border-slate-800 bg-[#13131F] p-5"><div className="text-xs font-semibold text-slate-400">{label}</div><div className={`mt-2 text-2xl font-black font-display ${color}`}>{value}</div></div> }
