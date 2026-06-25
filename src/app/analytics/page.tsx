'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area,
  BarChart, Bar, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import Sidebar from '@/components/layout/Sidebar'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

type TimeRange = '7d' | '30d' | '90d' | 'all'
type StatKey = 'str' | 'int' | 'wis' | 'vit' | 'gold' | 'cha'

const STAT_META: Record<StatKey, { label: string; color: string; icon: string }> = {
  str:  { label: 'STR',  color: '#EF4444', icon: '💪' },
  int:  { label: 'INT',  color: '#3B82F6', icon: '🧠' },
  wis:  { label: 'WIS',  color: '#22C55E', icon: '🧘' },
  vit:  { label: 'VIT',  color: '#F97316', icon: '❤️' },
  gold: { label: 'GOLD', color: '#F59E0B', icon: '💰' },
  cha:  { label: 'CHA',  color: '#7C3AED', icon: '🗣️' },
}

const CATEGORY_COLORS: Record<string, string> = {
  str: '#EF4444', int: '#3B82F6', wis: '#22C55E',
  vit: '#F97316', gold: '#F59E0B', cha: '#7C3AED',
}

interface DailySnapshot {
  snapshot_date: string
  str: number; int: number; wis: number
  vit: number; gold: number; cha: number
  level: number; total_xp: number; quests_completed: number
}

interface XPHistoryItem {
  created_at?: string
  completed_at?: string
  xp_earned: number
}

interface InsightItem {
  type: 'strength' | 'warning' | 'opportunity'
  title: string
  body: string
  action: string
}

const TOOLTIP_STYLE = {
  background: '#1A1A2E',
  border: '1px solid #2E2E50',
  borderRadius: 8,
  color: '#F1F0FF',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
}

// GitHub-style heatmap component
function ConsistencyHeatmap({ data }: { data: { date: string; pct: number }[] }) {
  const weeks = 12
  const days = 7
  const cells: { date: string; pct: number }[] = []

  const today = new Date()
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < days; d++) {
      const date = new Date(today)
      date.setDate(today.getDate() - (w * 7 + (days - 1 - d)))
      const dateStr = date.toISOString().split('T')[0]
      const entry = data.find(x => x.date === dateStr)
      cells.push({ date: dateStr, pct: entry?.pct ?? 0 })
    }
  }

  function getColor(pct: number) {
    if (pct === 0) return '#1E1E35'
    if (pct < 0.4) return '#3B1F6B'
    if (pct < 0.7) return '#5B21B6'
    if (pct < 1.0) return '#7C3AED'
    return '#9F67FF'
  }

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div>
      <div className="flex gap-1 mb-1">
        <div style={{ width: 16 }} />
        <div className="flex gap-1 flex-1">
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} className="flex-1 text-center text-xs" style={{ color: '#5C5A7A' }} />
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1" style={{ width: 16 }}>
          {DAYS.map((d, i) => (
            <div key={i} className="text-xs flex items-center justify-center" style={{ color: '#5C5A7A', height: 14 }}>{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex gap-1 flex-1">
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} className="flex flex-col gap-1 flex-1">
              {Array.from({ length: days }).map((_, d) => {
                const cell = cells[w * days + d]
                if (!cell) return <div key={d} style={{ height: 14 }} />
                return (
                  <motion.div
                    key={d}
                    className="rounded-sm cursor-pointer transition-all duration-200"
                    style={{
                      background: getColor(cell.pct),
                      height: 14,
                      border: cell.date === today.toISOString().split('T')[0] ? '1px solid #9F67FF' : '1px solid transparent',
                    }}
                    title={`${cell.date} — ${Math.round(cell.pct * 100)}% complete`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (w * days + d) * 0.002 }}
                    whileHover={{ scale: 1.2 }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: '#5C5A7A' }}>
        <span>Less</span>
        {['#1E1E35', '#3B1F6B', '#5B21B6', '#7C3AED', '#9F67FF'].map(c => (
          <div key={c} className="rounded-sm" style={{ width: 12, height: 12, background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

const INSIGHT_CONFIG = {
  strength:    { icon: '💪', label: 'Strength',    border: '#22C55E', bg: '#22C55E10' },
  warning:     { icon: '⚠️', label: 'Warning',     border: '#F59E0B', bg: '#F59E0B10' },
  opportunity: { icon: '🎯', label: 'Opportunity', border: '#7C3AED', bg: '#7C3AED10' },
}

export default function AnalyticsPage() {
  const { profile, stats, loading } = useProfile()
  const supabase = createClient()
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [activeStat, setActiveStat] = useState<StatKey>('str')
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([])
  const [xpHistory, setXpHistory] = useState<{ date: string; xp: number; quests: number }[]>([])
  const [heatmapData, setHeatmapData] = useState<{ date: string; pct: number }[]>([])
  const [insights, setInsights] = useState<InsightItem[]>([])
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [questsByCategory, setQuestsByCategory] = useState<{ name: string; value: number; color: string }[]>([])

  const getDaysBack = useCallback(() => {
    if (timeRange === '7d') return 7
    if (timeRange === '30d') return 30
    if (timeRange === '90d') return 90
    return 365
  }, [timeRange])

  useEffect(() => {
    async function fetchData() {
      if (!profile?.id) return
      setDataLoading(true)
      try {
        const daysBack = getDaysBack()
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - daysBack)
        const fromStr = fromDate.toISOString().split('T')[0]

        const [snapshotsRes, completionsRes, allCompletionsRes] = await Promise.all([
          supabase
            .from('daily_stats_snapshots')
            .select('*')
            .eq('user_id', profile.id)
            .gte('snapshot_date', fromStr)
            .order('snapshot_date'),
          supabase
            .from('habit_completions')
            .select('completed_at, xp_earned, habits(stat_category)')
            .eq('user_id', profile.id)
            .gte('completed_at', fromStr + 'T00:00:00')
            .order('completed_at'),
          supabase
            .from('habit_completions')
            .select('habits(stat_category)')
            .eq('user_id', profile.id),
        ])

        if (snapshotsRes.data) setSnapshots(snapshotsRes.data as DailySnapshot[])

        // XP history by day
        if (completionsRes.data) {
          const byDate: Record<string, { xp: number; quests: number }> = {}
          completionsRes.data.forEach((c: XPHistoryItem & { habits?: { stat_category?: string } }) => {
            const date = (c.completed_at ?? '').split('T')[0]
            if (!byDate[date]) byDate[date] = { xp: 0, quests: 0 }
            byDate[date].xp += c.xp_earned ?? 0
            byDate[date].quests += 1
          })
          setXpHistory(Object.entries(byDate).map(([date, v]) => ({ date, ...v })))

          // Heatmap: daily completion percentage
          const today = new Date()
          const heatEntries: { date: string; pct: number }[] = []
          for (let i = 84; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            const ds = d.toISOString().split('T')[0]
            const dayQuests = byDate[ds]?.quests ?? 0
            heatEntries.push({ date: ds, pct: Math.min(1, dayQuests / 5) }) // assume ~5 quests/day
          }
          setHeatmapData(heatEntries)
        }

        // Quest by category
        if (allCompletionsRes.data) {
          const catCount: Record<string, number> = {}
          allCompletionsRes.data.forEach((c: { habits?: { stat_category?: string } | null }) => {
            const cat = (c.habits as { stat_category?: string } | null)?.stat_category ?? 'other'
            catCount[cat] = (catCount[cat] ?? 0) + 1
          })
          setQuestsByCategory(Object.entries(catCount).map(([name, value]) => ({
            name: name.toUpperCase(),
            value,
            color: CATEGORY_COLORS[name] ?? '#5C5A7A',
          })))
        }
      } finally {
        setDataLoading(false)
      }
    }
    if (!loading) fetchData()
  }, [profile?.id, loading, timeRange, getDaysBack])

  // Fetch AI insights
  useEffect(() => {
    async function fetchInsights() {
      if (!profile?.id) return
      setInsightsLoading(true)
      try {
        const resp = await fetch('/api/analytics/insights')
        if (resp.ok) {
          const data = await resp.json()
          if (Array.isArray(data)) setInsights(data)
        }
      } catch { /* fail silently */ }
      finally { setInsightsLoading(false) }
    }
    if (!loading) fetchInsights()
  }, [profile?.id, loading])

  const xpThisWeek = xpHistory
    .filter(d => {
      const date = new Date(d.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    })
    .reduce((s, d) => s + d.xp, 0)

  const questsThisWeek = xpHistory.filter(d => {
    const date = new Date(d.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date >= weekAgo
  }).reduce((s, d) => s + d.quests, 0)

  const totalQuests = questsByCategory.reduce((s, c) => s + c.value, 0)

  // Radar data
  const radarData = stats ? [
    { stat: 'STR', value: stats.str, fullMark: 100 },
    { stat: 'INT', value: stats.int, fullMark: 100 },
    { stat: 'WIS', value: stats.wis, fullMark: 100 },
    { stat: 'VIT', value: stats.vit, fullMark: 100 },
    { stat: 'GOLD', value: stats.gold, fullMark: 100 },
    { stat: 'CHA', value: stats.cha, fullMark: 100 },
  ] : []

  const statValues = stats ? [stats.str, stats.int, stats.wis, stats.vit, stats.gold, stats.cha] : []
  const strongestStat = statValues.length > 0 ? Object.keys(STAT_META)[statValues.indexOf(Math.max(...statValues))] : 'str'
  const weakestStat = statValues.length > 0 ? Object.keys(STAT_META)[statValues.indexOf(Math.min(...statValues))] : 'cha'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📊</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Compiling your legend...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#08080F' }}>
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? '⚔️'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto" style={{ marginLeft: 240 }}>
        <div className="p-6 xl:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
                Analytics 📊
              </h1>
              <p style={{ color: '#9B99B8' }}>Your growth, visualized.</p>
            </div>
            {/* Time filter */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#13131F', border: '1px solid #1E1E35' }}>
              {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background: timeRange === t ? '#7C3AED' : 'transparent',
                    color: timeRange === t ? '#fff' : '#9B99B8',
                    fontFamily: 'Oxanium, sans-serif',
                  }}
                >
                  {t === 'all' ? 'All' : t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Summary stat cards */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Total XP */}
            <div className="p-5 rounded-2xl border" style={{ background: '#13131F', borderColor: '#F59E0B22' }}>
              <div className="text-xl mb-1">⚡</div>
              <div className="text-2xl font-bold mb-1 font-display" style={{ color: '#F59E0B' }}>
                <AnimatedNumber value={profile?.xp ?? 0} />
              </div>
              <div className="text-xs mb-1" style={{ color: '#5C5A7A' }}>Total XP</div>
              {xpThisWeek > 0 && (
                <div className="text-xs" style={{ color: '#22C55E' }}>+{xpThisWeek} this week</div>
              )}
            </div>

            {/* Level */}
            <div className="p-5 rounded-2xl border" style={{ background: '#13131F', borderColor: '#7C3AED22' }}>
              <div className="text-xl mb-1">⭐</div>
              <div className="text-2xl font-bold mb-1 font-display" style={{ color: '#7C3AED' }}>
                <AnimatedNumber value={profile?.level ?? 1} />
              </div>
              <div className="text-xs mb-1" style={{ color: '#5C5A7A' }}>Current Level</div>
              <div className="text-xs" style={{ color: '#9B99B8' }}>
                {(profile?.xp_to_next ?? 100) - (profile?.xp ?? 0)} XP to Lv {(profile?.level ?? 1) + 1}
              </div>
            </div>

            {/* Quest completion rate */}
            <div className="p-5 rounded-2xl border" style={{ background: '#13131F', borderColor: '#22C55E22' }}>
              <div className="text-xl mb-1">✅</div>
              <div
                className="text-2xl font-bold mb-1 font-display"
                style={{ color: questsThisWeek > 0 ? '#22C55E' : '#5C5A7A' }}
              >
                {questsThisWeek}
              </div>
              <div className="text-xs mb-1" style={{ color: '#5C5A7A' }}>Quests This Week</div>
              <div className="text-xs" style={{ color: '#9B99B8' }}>
                {totalQuests} total completed
              </div>
            </div>

            {/* Best streak */}
            <div className="p-5 rounded-2xl border" style={{ background: '#13131F', borderColor: '#F59E0B22' }}>
              <div className="text-xl mb-1">🔥</div>
              <div className="text-2xl font-bold mb-1 font-display" style={{ color: '#F59E0B' }}>
                <AnimatedNumber value={profile?.streak ?? 0} suffix="d" />
              </div>
              <div className="text-xs mb-1" style={{ color: '#5C5A7A' }}>Current Streak</div>
              <div className="text-xs" style={{ color: '#9B99B8' }}>Keep it alive! 🔥</div>
            </div>
          </motion.div>

          {dataLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: '#13131F' }} />
              ))}
            </div>
          ) : (
            <>
              {/* Charts row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Chart 1: XP over time */}
                <motion.div
                  className="p-6 rounded-2xl border"
                  style={{ background: '#13131F', borderColor: '#1E1E35' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-base font-bold mb-4 font-display" style={{ color: '#F1F0FF' }}>
                    XP Over Time ⚡
                  </h2>
                  {xpHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={xpHistory}>
                        <defs>
                          <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E35" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5C5A7A' }} tickFormatter={v => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10, fill: '#5C5A7A' }} />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(v: any) => [`${v} XP`, 'XP earned']}
                        />
                        <Area type="monotone" dataKey="xp" stroke="#7C3AED" fill="url(#xpGradient)" strokeWidth={2} dot={false} animationDuration={1000} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#5C5A7A' }}>
                      Complete quests to see XP history 📈
                    </div>
                  )}
                </motion.div>

                {/* Chart 2: Stat radar */}
                <motion.div
                  className="p-6 rounded-2xl border"
                  style={{ background: '#13131F', borderColor: '#1E1E35' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2 className="text-base font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
                    Your Life Balance 🕸️
                  </h2>
                  <p className="text-xs mb-3" style={{ color: '#5C5A7A' }}>
                    Strongest: <span style={{ color: STAT_META[strongestStat as StatKey]?.color }}>{STAT_META[strongestStat as StatKey]?.label}</span>
                    {' · '}
                    Weakest: <span style={{ color: STAT_META[weakestStat as StatKey]?.color }}>{STAT_META[weakestStat as StatKey]?.label}</span>
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#1E1E35" />
                      <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11, fill: '#9B99B8' }} />
                      <Radar name="Stats" dataKey="value" stroke="#F59E0B" fill="#7C3AED" fillOpacity={0.4} strokeWidth={2} animationDuration={1000} />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Chart 3: Heatmap */}
              <motion.div
                className="p-6 rounded-2xl border mb-6"
                style={{ background: '#13131F', borderColor: '#1E1E35' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-base font-bold mb-4 font-display" style={{ color: '#F1F0FF' }}>
                  Your Consistency Map 📅
                </h2>
                <ConsistencyHeatmap data={heatmapData} />
              </motion.div>

              {/* Charts row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Chart 4: Stat growth */}
                <motion.div
                  className="p-6 rounded-2xl border"
                  style={{ background: '#13131F', borderColor: '#1E1E35' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold font-display" style={{ color: '#F1F0FF' }}>
                      Stat Growth Over Time 📈
                    </h2>
                  </div>
                  {/* Stat toggle */}
                  <div className="flex gap-1 flex-wrap mb-4">
                    {(Object.keys(STAT_META) as StatKey[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setActiveStat(s)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: activeStat === s ? STAT_META[s].color + '33' : '#0F0F1A',
                          color: activeStat === s ? STAT_META[s].color : '#5C5A7A',
                          border: `1px solid ${activeStat === s ? STAT_META[s].color + '66' : '#1E1E35'}`,
                          fontFamily: 'Oxanium, sans-serif',
                        }}
                      >
                        {STAT_META[s].icon} {STAT_META[s].label}
                      </button>
                    ))}
                  </div>
                  {snapshots.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={snapshots}>
                        <defs>
                          <linearGradient id={`statGrad-${activeStat}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={STAT_META[activeStat].color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={STAT_META[activeStat].color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E35" />
                        <XAxis dataKey="snapshot_date" tick={{ fontSize: 10, fill: '#5C5A7A' }} tickFormatter={v => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10, fill: '#5C5A7A' }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Area
                          type="monotone"
                          dataKey={activeStat}
                          stroke={STAT_META[activeStat].color}
                          fill={`url(#statGrad-${activeStat})`}
                          strokeWidth={2}
                          dot={false}
                          animationDuration={800}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-sm" style={{ color: '#5C5A7A' }}>
                      Complete quests to track stat growth 📊
                    </div>
                  )}
                </motion.div>

                {/* Chart 5: Quest distribution pie */}
                <motion.div
                  className="p-6 rounded-2xl border"
                  style={{ background: '#13131F', borderColor: '#1E1E35' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-base font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
                    What You Focus On Most 🎯
                  </h2>
                  <p className="text-xs mb-4" style={{ color: '#5C5A7A' }}>{totalQuests} total quests</p>
                  {questsByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={questsByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          dataKey="value"
                          animationDuration={1000}
                        >
                          {questsByCategory.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Legend
                          formatter={(value) => <span style={{ color: '#9B99B8', fontSize: 11 }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#5C5A7A' }}>
                      Complete quests to see distribution 🎯
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Chart 6: Daily XP bars */}
              <motion.div
                className="p-6 rounded-2xl border mb-8"
                style={{ background: '#13131F', borderColor: '#1E1E35' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="text-base font-bold mb-4 font-display" style={{ color: '#F1F0FF' }}>
                  Daily XP — Last 14 Days ⚡
                </h2>
                {xpHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={xpHistory.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E1E35" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5C5A7A' }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10, fill: '#5C5A7A' }} />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(v: any, _name: any, props: any) => [
                          `${v} XP (${props.payload?.quests ?? 0} quests)`,
                          'XP earned',
                        ]}
                      />
                      <Bar dataKey="xp" radius={[4, 4, 0, 0]} animationDuration={800}>
                        {xpHistory.slice(-14).map((entry, i) => {
                          const isThisWeek = new Date(entry.date) >= (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d })()
                          return <Cell key={i} fill={isThisWeek ? '#7C3AED' : '#3E3E5A'} />
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-sm" style={{ color: '#5C5A7A' }}>
                    No XP data yet — start completing quests! ⚡
                  </div>
                )}
              </motion.div>

              {/* AI Insights */}
              <div>
                <h2 className="text-lg font-bold mb-4 font-display" style={{ color: '#F1F0FF' }}>
                  Your Insights 🤖
                </h2>
                {insightsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-5 rounded-2xl border animate-pulse" style={{ background: '#13131F', borderColor: '#1E1E35', height: 160 }}>
                        <div className="text-xs mb-2" style={{ color: '#5C5A7A' }}>Analyzing your data...</div>
                      </div>
                    ))}
                  </div>
                ) : insights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insights.map((insight, i) => {
                      const cfg = INSIGHT_CONFIG[insight.type]
                      return (
                        <motion.div
                          key={i}
                          className="p-5 rounded-2xl border"
                          style={{
                            background: cfg.bg,
                            borderColor: cfg.border + '55',
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{cfg.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.border, fontFamily: 'Oxanium, sans-serif' }}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="font-bold text-sm mb-2 font-display" style={{ color: '#F1F0FF' }}>
                            {insight.title}
                          </div>
                          <p className="text-xs mb-3" style={{ color: '#9B99B8' }}>
                            {insight.body}
                          </p>
                          <div className="text-xs font-semibold" style={{ color: cfg.border }}>
                            → {insight.action}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border text-center" style={{ background: '#13131F', borderColor: '#1E1E35' }}>
                    <div className="text-3xl mb-2">🤖</div>
                    <p className="text-sm" style={{ color: '#5C5A7A' }}>
                      Complete more quests to unlock AI insights about your journey.
                    </p>
                    <Link href="/quests" className="inline-block mt-3 text-xs px-4 py-2 rounded-xl" style={{ background: '#7C3AED22', color: '#9F67FF' }}>
                      Go to Quests →
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
