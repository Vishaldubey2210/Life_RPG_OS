'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Calendar, TrendingUp, Clock, RefreshCw } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

interface CompletionHistoryItem {
  id: string
  completed_at: string
  habits: {
    name: string
    emoji: string
    stat_category: string
  } | null
}

export default function AnalyticsPage() {
  const { profile, stats, habits, loading, refetch } = useProfile()
  const supabase = createClient()

  const [history, setHistory] = useState<CompletionHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Join query to fetch completions along with the linked quest's details
        const { data, error } = await supabase
          .from('habit_completions')
          .select(`
            id,
            completed_at,
            habits (
              name,
              emoji,
              stat_category
            )
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setHistory((data as unknown as CompletionHistoryItem[]) || [])
      } catch (err) {
        console.error('Error fetching completions history:', err)
      } finally {
        setHistoryLoading(false)
      }
    }

    if (profile?.id) {
      fetchHistory()
    }
  }, [profile?.id, supabase])

  const totalCompletions = history.length
  const str = stats?.str ?? 0
  const intellect = stats?.int ?? 0
  const wis = stats?.wis ?? 0
  const vit = stats?.vit ?? 0
  const cha = stats?.cha ?? 0
  const gold = stats?.gold ?? 0
  const sumStats = str + intellect + wis + vit + cha

  // Calculate percentages for stat distribution chart
  const statBreakdown = [
    { label: 'Strength (STR)', val: str, pct: sumStats > 0 ? (str / sumStats) * 100 : 0, color: '#EF4444' },
    { label: 'Intellect (INT)', val: intellect, pct: sumStats > 0 ? (intellect / sumStats) * 100 : 0, color: '#3B82F6' },
    { label: 'Wisdom (WIS)', val: wis, pct: sumStats > 0 ? (wis / sumStats) * 100 : 0, color: '#22C55E' },
    { label: 'Vitality (VIT)', val: vit, pct: sumStats > 0 ? (vit / sumStats) * 100 : 0, color: '#EF4444' },
    { label: 'Charisma (CHA)', val: cha, pct: sumStats > 0 ? (cha / sumStats) * 100 : 0, color: '#9F67FF' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📊</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Compiling Analytics Ledger...
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

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240 }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
              Analytics & Progression 📊
            </h1>
            <p style={{ color: '#9B99B8' }}>
              Detailed breakdown of your stats growth, leveling rate, and quest history.
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Stats', val: sumStats, icon: BarChart2, color: '#9F67FF' },
              { label: 'Daily Streak', val: `${profile?.streak ?? 0} days`, icon: TrendingUp, color: '#F59E0B' },
              { label: 'Active Quests', val: habits.length, icon: Calendar, color: '#3B82F6' },
              { label: 'Gold Balance', val: `🪙 ${gold}`, icon: RefreshCw, color: '#F59E0B' },
            ].map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border"
                style={{ background: '#13131F', borderColor: '#1E1E35' }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs" style={{ color: '#5C5A7A' }}>{m.label}</span>
                  <m.icon size={16} style={{ color: m.color }} />
                </div>
                <h3 className="text-xl font-bold font-display" style={{ color: '#F1F0FF' }}>
                  {m.val}
                </h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stat Distribution chart */}
            <div
              className="lg:col-span-2 p-6 rounded-2xl border"
              style={{ background: '#13131F', borderColor: '#1E1E35' }}
            >
              <h2 className="text-lg font-bold font-display mb-6" style={{ color: '#F1F0FF' }}>
                Stat Distribution
              </h2>
              <div className="space-y-5">
                {statBreakdown.map((s, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span style={{ color: '#9B99B8' }}>{s.label}</span>
                      <span style={{ color: s.color, fontFamily: 'Oxanium, sans-serif' }}>
                        {s.val} points ({Math.round(s.pct)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: s.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Feed */}
            <div
              className="p-6 rounded-2xl border flex flex-col"
              style={{ background: '#13131F', borderColor: '#1E1E35' }}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: '#1E1E35' }}>
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: '#3B82F6' }} />
                  <span className="font-semibold font-display" style={{ color: '#F1F0FF' }}>Raid History</span>
                </div>
                <span className="text-xs" style={{ color: '#5C5A7A' }}>Recent logs</span>
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center flex-1 py-12">
                  <Loader2 className="animate-spin text-slate-500" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                  <div className="text-4xl mb-2">📜</div>
                  <h4 className="text-sm font-semibold" style={{ color: '#9B99B8' }}>Ledger is empty</h4>
                  <p className="text-xxs max-w-[180px] mt-1" style={{ color: '#5C5A7A' }}>
                    Complete quests from the dashboard to log action history here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-1">
                  {history.map((item) => (
                    <div key={item.id} className="flex gap-3 text-xs border-b pb-3" style={{ borderColor: '#1E1E35' }}>
                      <span className="text-2xl">{item.habits?.emoji ?? '⚔️'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate" style={{ color: '#F1F0FF' }}>
                          {item.habits?.name ?? 'Unknown Quest'}
                        </p>
                        <p className="text-xxs mt-0.5" style={{ color: '#5C5A7A' }}>
                          Completed on {new Date(item.completed_at).toLocaleDateString()} at{' '}
                          {new Date(item.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
