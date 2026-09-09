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
import {
  Dumbbell,
  Brain,
  Sparkles,
  Heart,
  Coins,
  MessageSquare,
  Flame,
  Zap,
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Target,
  CheckCircle2,
  Bot,
  Star,
  Activity,
  LucideIcon,
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

type TimeRange = '7d' | '30d' | '90d' | 'all'
type StatKey = 'str' | 'int' | 'wis' | 'vit' | 'gold' | 'cha'

const STAT_META: Record<StatKey, { label: string; color: string; icon: LucideIcon }> = {
  str:  { label: 'STR',  color: '#EF4444', icon: Dumbbell },
  int:  { label: 'INT',  color: '#3B82F6', icon: Brain },
  wis:  { label: 'WIS',  color: '#22C55E', icon: Sparkles },
  vit:  { label: 'VIT',  color: '#F97316', icon: Heart },
  gold: { label: 'GOLD', color: '#F59E0B', icon: Coins },
  cha:  { label: 'CHA',  color: '#7C3AED', icon: MessageSquare },
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
  background: '#FFFFFF',
  border: '1px solid #EAE6DD',
  borderRadius: 12,
  color: '#232019',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
    if (pct === 0) return '#FAF8F5'
    if (pct < 0.4) return '#EDE9FE'
    if (pct < 0.7) return '#C4B5FD'
    if (pct < 1.0) return '#8B5CF6'
    return '#5B57F0'
  }

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div>
      <div className="flex gap-1 mb-1">
        <div style={{ width: 16 }} />
        <div className="flex gap-1 flex-1">
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} className="flex-1 text-center text-xs text-[#8A857A]" />
          ))}
        </div>
      </div>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1" style={{ width: 16 }}>
          {DAYS.map((d, i) => (
            <div key={i} className="text-2xs text-[#8A857A] flex items-center justify-center font-semibold" style={{ height: 14 }}>{d}</div>
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
                      border: cell.date === today.toISOString().split('T')[0] ? '1.5px solid #5B57F0' : '1px solid #EAE6DD',
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
      <div className="flex items-center gap-2 mt-3 text-xs text-[#8A857A]">
        <span>Less</span>
        {['#FAF8F5', '#EDE9FE', '#C4B5FD', '#8B5CF6', '#5B57F0'].map(c => (
          <div key={c} className="rounded-sm border border-[#EAE6DD]" style={{ width: 12, height: 12, background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

const INSIGHT_CONFIG = {
  strength:    { icon: Dumbbell, label: 'Strength',    border: '#10B981', bg: '#ECFDF5' },
  warning:     { icon: AlertTriangle, label: 'Warning',     border: '#F59E0B', bg: '#FFFBEB' },
  opportunity: { icon: Target, label: 'Opportunity', border: '#5B57F0', bg: '#F5F3FF' },
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

        // Quest distribution by category
        if (allCompletionsRes.data) {
          const counts: Record<string, number> = {}
          allCompletionsRes.data.forEach((c: { habits?: { stat_category?: string } | { stat_category?: string }[] }) => {
            const cat = (Array.isArray(c.habits) ? c.habits[0]?.stat_category : c.habits?.stat_category) ?? 'other'
            counts[cat] = (counts[cat] ?? 0) + 1
          })
          setQuestsByCategory(
            Object.entries(counts).map(([k, v]) => ({
              name: STAT_META[k as StatKey]?.label ?? k.toUpperCase(),
              value: v,
              color: CATEGORY_COLORS[k] ?? '#6B7280',
            }))
          )
        }
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [profile?.id, timeRange, getDaysBack, supabase])

  // AI insights generator
  useEffect(() => {
    async function loadInsights() {
      if (!profile || !stats) return
      setInsightsLoading(true)

      const statEntries = Object.entries(stats).filter(([k]) => k in STAT_META) as [StatKey, number][]
      statEntries.sort((a, b) => b[1] - a[1])

      const strongest = statEntries[0]
      const weakest = statEntries[statEntries.length - 1]

      const generated: InsightItem[] = []

      if (strongest) {
        generated.push({
          type: 'strength',
          title: `${STAT_META[strongest[0]].label} is your highest stat (${strongest[1]} pts)`,
          body: `You consistently conquer ${STAT_META[strongest[0]].label}-related habits. This is your core character superpower.`,
          action: `Consider taking on higher-tier ${STAT_META[strongest[0]].label} quests to accelerate leveling.`,
        })
      }

      if (weakest && weakest[1] < (strongest?.[1] ?? 1) * 0.5) {
        generated.push({
          type: 'warning',
          title: `${STAT_META[weakest[0]].label} needs attention (${weakest[1]} pts)`,
          body: `Your ${STAT_META[weakest[0]].label} is lagging behind other stats. Balanced heroes level up 2x faster.`,
          action: `Add at least 1 easy ${STAT_META[weakest[0]].label} habit to your daily roster.`,
        })
      }

      if ((profile.streak ?? 0) >= 3) {
        generated.push({
          type: 'opportunity',
          title: `${profile.streak}-day streak momentum!`,
          body: `You have built solid neural pathway momentum. The critical milestone is day 21.`,
          action: `Keep your current daily routine locked in for the next 7 days.`,
        })
      } else {
        generated.push({
          type: 'opportunity',
          title: 'Prime time to start a new streak',
          body: `Consistency beats intensity every single time. 1 quest done daily > 5 done erratically.`,
          action: `Commit to just 1 easy quest today to ignite your streak counter.`,
        })
      }

      setInsights(generated.slice(0, 3))
      setInsightsLoading(false)
    }
    loadInsights()
  }, [profile, stats])

  const totalQuests = questsByCategory.reduce((sum, x) => sum + x.value, 0)
  const xpThisWeek = xpHistory.slice(-7).reduce((sum, x) => sum + x.xp, 0)
  const questsThisWeek = xpHistory.slice(-7).reduce((sum, x) => sum + x.quests, 0)

  // Balance radar data
  const radarData = (Object.keys(STAT_META) as StatKey[]).map(s => ({
    stat: STAT_META[s].label,
    value: (stats as any)?.[s] ?? 0,
    fullMark: 100,
  }))

  const statValues = Object.entries(stats ?? {}).filter(([k]) => k in STAT_META) as [StatKey, number][]
  statValues.sort((a, b) => b[1] - a[1])
  const strongestStat = statValues[0]?.[0] ?? 'str'
  const weakestStat = statValues[statValues.length - 1]?.[0] ?? 'int'

  return (
    <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]">
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? 'leaf'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240 }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-2 text-[#232019]">
                <BarChart3 size={28} className="text-[#5B57F0]" />
                <span>Analytics</span>
              </h1>
              <p className="text-sm text-[#6E6A61]">Your growth, visualized.</p>
            </div>
            {/* Time filter */}
            <div className="flex gap-1 p-1 rounded-xl bg-white border border-[#EAE6DD] shadow-2xs">
              {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    timeRange === t
                      ? 'bg-[#5B57F0] text-white shadow-2xs'
                      : 'text-[#6E6A61] hover:bg-[#FAF8F5]'
                  }`}
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
            <div className="p-5 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Zap size={18} />
              </div>
              <div className="text-2xl font-bold mb-1 text-amber-600">
                <AnimatedNumber value={profile?.xp ?? 0} />
              </div>
              <div className="text-xs mb-1 text-[#8A857A]">Total XP</div>
              {xpThisWeek > 0 && (
                <div className="text-xs font-semibold text-emerald-600">+{xpThisWeek} this week</div>
              )}
            </div>

            {/* Level */}
            <div className="p-5 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B57F0] flex items-center justify-center mb-2">
                <Star size={18} />
              </div>
              <div className="text-2xl font-bold mb-1 text-[#5B57F0]">
                <AnimatedNumber value={profile?.level ?? 1} />
              </div>
              <div className="text-xs mb-1 text-[#8A857A]">Current Level</div>
              <div className="text-xs text-[#6E6A61]">
                {(profile?.xp_to_next ?? 100) - (profile?.xp ?? 0)} XP to Lv {(profile?.level ?? 1) + 1}
              </div>
            </div>

            {/* Quest completion rate */}
            <div className="p-5 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 size={18} />
              </div>
              <div
                className={`text-2xl font-bold mb-1 ${questsThisWeek > 0 ? 'text-emerald-600' : 'text-[#8A857A]'}`}
              >
                {questsThisWeek}
              </div>
              <div className="text-xs mb-1 text-[#8A857A]">Quests This Week</div>
              <div className="text-xs text-[#6E6A61]">
                {totalQuests} total completed
              </div>
            </div>

            {/* Best streak */}
            <div className="p-5 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Flame size={18} />
              </div>
              <div className="text-2xl font-bold mb-1 text-amber-600">
                <AnimatedNumber value={profile?.streak ?? 0} suffix="d" />
              </div>
              <div className="text-xs mb-1 text-[#8A857A]">Current Streak</div>
              <div className="text-xs flex items-center gap-1 text-[#6E6A61]">
                <Flame size={12} className="text-amber-500" /> Keep it alive!
              </div>
            </div>
          </motion.div>

          {dataLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl animate-pulse bg-white border border-[#EAE6DD]" />
              ))}
            </div>
          ) : (
            <>
              {/* Charts row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Chart 1: XP over time */}
                <motion.div
                  className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-[#232019]">
                    <Zap size={16} className="text-amber-500" />
                    <span>XP Over Time</span>
                  </h2>
                  {xpHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={xpHistory}>
                        <defs>
                          <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5B57F0" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#5B57F0" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAE6DD" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8A857A' }} tickFormatter={v => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10, fill: '#8A857A' }} />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(v: any) => [`${v} XP`, 'XP earned']}
                        />
                        <Area type="monotone" dataKey="xp" stroke="#5B57F0" fill="url(#xpGradient)" strokeWidth={2} dot={false} animationDuration={1000} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-sm text-[#8A857A]">
                      Complete quests to see XP history
                    </div>
                  )}
                </motion.div>

                {/* Chart 2: Stat radar */}
                <motion.div
                  className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <h2 className="text-base font-bold mb-1 flex items-center gap-2 text-[#232019]">
                    <Activity size={16} className="text-[#5B57F0]" />
                    <span>Your Life Balance</span>
                  </h2>
                  <p className="text-xs mb-3 text-[#6E6A61]">
                    Strongest: <span style={{ color: STAT_META[strongestStat as StatKey]?.color }}>{STAT_META[strongestStat as StatKey]?.label}</span>
                    {' · '}
                    Weakest: <span style={{ color: STAT_META[weakestStat as StatKey]?.color }}>{STAT_META[weakestStat as StatKey]?.label}</span>
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#EAE6DD" />
                      <PolarAngleAxis dataKey="stat" tick={{ fontSize: 11, fill: '#6E6A61' }} />
                      <Radar name="Stats" dataKey="value" stroke="#5B57F0" fill="#5B57F0" fillOpacity={0.25} strokeWidth={2} animationDuration={1000} />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Chart 3: Heatmap */}
              <motion.div
                className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-[#232019]">
                  <Calendar size={16} className="text-blue-500" />
                  <span>Your Consistency Map</span>
                </h2>
                <ConsistencyHeatmap data={heatmapData} />
              </motion.div>

              {/* Charts row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Chart 4: Stat growth */}
                <motion.div
                  className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold flex items-center gap-2 text-[#232019]">
                      <TrendingUp size={16} className="text-emerald-600" />
                      <span>Stat Growth Over Time</span>
                    </h2>
                  </div>
                  {/* Stat toggle */}
                  <div className="flex gap-1 flex-wrap mb-4">
                    {(Object.keys(STAT_META) as StatKey[]).map(s => {
                      const StatIcon = STAT_META[s].icon
                      return (
                        <button
                          key={s}
                          onClick={() => setActiveStat(s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          style={{
                            background: activeStat === s ? STAT_META[s].color + '15' : '#FAF8F5',
                            color: activeStat === s ? STAT_META[s].color : '#6E6A61',
                            border: `1px solid ${activeStat === s ? STAT_META[s].color + '55' : '#EAE6DD'}`,
                          }}
                        >
                          <StatIcon size={12} /> {STAT_META[s].label}
                        </button>
                      )
                    })}
                  </div>
                  {snapshots.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={snapshots}>
                        <defs>
                          <linearGradient id={`statGrad-${activeStat}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={STAT_META[activeStat].color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={STAT_META[activeStat].color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAE6DD" />
                        <XAxis dataKey="snapshot_date" tick={{ fontSize: 10, fill: '#8A857A' }} tickFormatter={v => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10, fill: '#8A857A' }} />
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
                    <div className="h-40 flex items-center justify-center text-sm text-[#8A857A]">
                      Complete quests to track stat growth
                    </div>
                  )}
                </motion.div>

                {/* Chart 5: Quest distribution pie */}
                <motion.div
                  className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-base font-bold mb-1 flex items-center gap-2 text-[#232019]">
                    <Target size={16} className="text-pink-500" />
                    <span>What You Focus On Most</span>
                  </h2>
                  <p className="text-xs mb-4 text-[#8A857A]">{totalQuests} total quests</p>
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
                          formatter={(value) => <span style={{ color: '#6E6A61', fontSize: 11 }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-sm text-[#8A857A]">
                      Complete quests to see distribution
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Chart 6: Daily XP bars */}
              <motion.div
                className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-[#232019]">
                  <Zap size={16} className="text-amber-500" />
                  <span>Daily XP — Last 14 Days</span>
                </h2>
                {xpHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={xpHistory.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EAE6DD" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8A857A' }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10, fill: '#8A857A' }} />
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
                          return <Cell key={i} fill={isThisWeek ? '#5B57F0' : '#D6D3FA'} />
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-sm text-[#8A857A]">
                    No XP data yet — start completing quests!
                  </div>
                )}
              </motion.div>

              {/* AI Insights */}
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#232019]">
                  <Bot size={20} className="text-[#5B57F0]" />
                  <span>Your Insights</span>
                </h2>
                {insightsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-[#EAE6DD] bg-white animate-pulse" style={{ height: 160 }}>
                        <div className="text-xs mb-2 text-[#8A857A]">Analyzing your data...</div>
                      </div>
                    ))}
                  </div>
                ) : insights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insights.map((insight, i) => {
                      const cfg = INSIGHT_CONFIG[insight.type]
                      const InsightIcon = cfg.icon
                      return (
                        <motion.div
                          key={i}
                          className="p-5 rounded-2xl border shadow-xs"
                          style={{
                            background: cfg.bg,
                            borderColor: cfg.border + '44',
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-2xs" style={{ background: `${cfg.border}20`, color: cfg.border }}>
                              <InsightIcon size={16} />
                            </div>
                            <span className="text-2xs font-bold uppercase tracking-wider" style={{ color: cfg.border }}>
                              {cfg.label}
                            </span>
                          </div>
                          <div className="font-bold text-sm mb-2 text-[#232019]">
                            {insight.title}
                          </div>
                          <p className="text-xs mb-3 text-[#6E6A61]">
                            {insight.body}
                          </p>
                          <div className="text-xs font-bold" style={{ color: cfg.border }}>
                            → {insight.action}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-[#EAE6DD] bg-white text-center shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#5B57F0] mx-auto mb-2">
                      <Bot size={24} />
                    </div>
                    <p className="text-sm text-[#8A857A]">
                      Complete more quests to unlock AI insights about your journey.
                    </p>
                    <Link href="/quests" className="inline-block mt-3 text-xs font-semibold px-4 py-2 rounded-xl bg-[#EDECFD] text-[#5B57F0]">
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
