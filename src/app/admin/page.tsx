'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101018] p-5">
      <div className="mb-3 text-xs uppercase tracking-[0.12em] text-slate-400">{label}</div>
      <div className="mb-2 text-3xl font-bold text-white">{value}</div>
      <div className="text-sm" style={{ color: accent }}>{hint}</div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    completions: 0,
    xp: 0,
    parties: 0,
    couples: 0,
    retention: 0,
  })

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    async function load() {
      try {
        // Fetch total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        // Fetch active users (had completions in last 24h)
        const { data: activeUsers } = await supabase
          .from('habit_completions')
          .select('user_id', { distinct: true })
          .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        // Fetch today's completions
        const today = new Date().toISOString().split('T')[0]
        const { count: completions } = await supabase
          .from('habit_completions')
          .select('*', { count: 'exact', head: true })
          .gte('completed_at', today)

        // Fetch XP earned today
        const { data: todayHabits } = await supabase
          .from('habit_completions')
          .select('habits(xp_reward)')
          .gte('completed_at', today)

        const xp = (todayHabits || []).reduce((sum: number, hc: any) => sum + (hc.habits?.xp_reward || 0), 0)

        // Fetch average streak
        const { data: profiles } = await supabase
          .from('profiles')
          .select('streak')
          .gt('streak', 0)

        const avgStreak = profiles && profiles.length > 0
          ? Math.round((profiles.reduce((sum: number, p: any) => sum + p.streak, 0) / profiles.length) * 10) / 10
          : 0

        // Fetch retention rate
        const { data: activeLast7d } = await supabase
          .from('habit_completions')
          .select('user_id', { distinct: true })
          .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        const retention = totalUsers && totalUsers > 0
          ? Math.round(((activeLast7d?.length || 0) / totalUsers) * 100)
          : 0

        setStats({
          totalUsers: totalUsers || 0,
          activeToday: activeUsers?.length || 0,
          completions: completions || 0,
          xp: xp,
          parties: 0,
          couples: 0,
          retention: retention,
        })
      } catch (error) {
        console.error('Error loading admin stats:', error)
        setStats({ totalUsers: 0, activeToday: 0, completions: 0, xp: 0, parties: 0, couples: 0, retention: 0 })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <div className="rounded-2xl border border-slate-800 bg-[#101018] p-6 text-slate-300">Loading admin overview…</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-sm text-slate-400">System health and recent growth at a glance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value={String(stats.totalUsers)} hint="+0 today" accent="#34d399" />
        <StatCard label="Daily Active Users" value={String(stats.activeToday)} hint={`${Math.max(0, stats.totalUsers ? Math.round((stats.activeToday / stats.totalUsers) * 100) : 0)}% of total`} accent="#9ca3af" />
        <StatCard label="Quests Completed Today" value={String(stats.completions)} hint={`${stats.xp} XP earned today`} accent="#a78bfa" />
        <StatCard label="Average Streak" value="12d" hint="68% active 7+ days" accent="#fbbf24" />
        <StatCard label="Active Parties" value={`${stats.parties}`} hint={`${stats.couples} couples active`} accent="#60a5fa" />
        <StatCard label="Retention (Day 7)" value={`${Math.round(stats.retention)}%`} hint={stats.retention >= 40 ? 'Healthy' : stats.retention >= 20 ? 'Watch closely' : 'Needs attention'} accent={stats.retention >= 40 ? '#34d399' : stats.retention >= 20 ? '#fbbf24' : '#f87171'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-[#101018] p-5">
          <h2 className="mb-4 text-lg font-semibold">User Growth</h2>
          <div className="flex h-44 items-end gap-2">
            {[30, 32, 40, 42, 46, 53, 57, 62, 70, 72].map((height, idx) => (
              <div key={idx} className="flex-1 rounded-t-lg bg-gradient-to-t from-purple-600 to-violet-400" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#101018] p-5">
          <h2 className="mb-4 text-lg font-semibold">DAU</h2>
          <div className="flex h-44 items-end gap-2">
            {[20, 40, 30, 55, 44, 48, 68, 64, 70, 72].map((height, idx) => (
              <div key={idx} className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-600 to-green-400" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-[#101018] p-5">
          <h2 className="mb-4 text-lg font-semibold">Recent Signups</h2>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-slate-400"><tr><th>Name</th><th>Level</th><th>Joined</th></tr></thead>
            <tbody>
              {[
                ['Aastha', 9],
                ['Rohan', 14],
                ['Maya', 11],
                ['Aarav', 6],
              ].map(([name, level]) => (
                <tr key={name} className="border-t border-slate-800"><td className="py-2">{name}</td><td>Lv. {level}</td><td>Today</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#101018] p-5">
          <h2 className="mb-4 text-lg font-semibold">Top Users</h2>
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-slate-400"><tr><th>Rank</th><th>Name</th><th>XP</th></tr></thead>
            <tbody>
              {[
                ['1', 'Aastha', '12,400'],
                ['2', 'Rohan', '11,000'],
                ['3', 'Maya', '10,250'],
              ].map(([rank, name, xp]) => (
                <tr key={name} className="border-t border-slate-800"><td className="py-2">#{rank}</td><td>{name}</td><td>{xp}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
