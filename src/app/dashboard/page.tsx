'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import StatBar from '@/components/ui/StatBar'
import XPBar from '@/components/ui/XPBar'
import QuestCard from '@/components/ui/QuestCard'
import LevelUpModal from '@/components/ui/LevelUpModal'
import { useProfile } from '@/hooks/useProfile'
import { useCompleteHabit } from '@/hooks/useCompleteHabit'
import { createClient } from '@/lib/supabase/client'

const STAT_CONFIG = [
  { key: 'str',  label: 'STR',  icon: '💪', color: '#EF4444' },
  { key: 'int',  label: 'INT',  icon: '🧠', color: '#3B82F6' },
  { key: 'wis',  label: 'WIS',  icon: '🧘', color: '#22C55E' },
  { key: 'vit',  label: 'VIT',  icon: '❤️', color: '#EF4444' },
  { key: 'gold', label: 'GOLD', icon: '💰', color: '#F59E0B' },
  { key: 'cha',  label: 'CHA',  icon: '🗣️', color: '#9F67FF' },
]

const CATEGORY_ICONS: Record<string, string> = {
  str: '💪', int: '🧠', wis: '🧘', vit: '❤️', gold: '💰', cha: '🗣️',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function WeekHeatmap({ completionPct }: { completionPct: number }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const today = new Date().getDay()
  const adjustedToday = today === 0 ? 6 : today - 1
  const opacities = [0.15, 0.35, 0.2, 0.45, 0.3, 0.5, 0.25]

  return (
    <div>
      <div className="text-xs mb-2 font-medium" style={{ color: '#9B99B8' }}>7-Day Activity</div>
      <div className="flex gap-2 mb-3">
        {days.map((d, i) => {
          const isPast = i <= adjustedToday
          const isToday = i === adjustedToday
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full aspect-square rounded-md transition-all duration-200"
                style={{
                  background: isToday
                    ? '#7C3AED'
                    : isPast
                    ? `rgba(124,58,237,${opacities[i % opacities.length]})`
                    : '#1E1E35',
                  border: isToday ? '1px solid #9F67FF' : '1px solid transparent',
                }}
              />
              <span className="text-xs" style={{ color: '#5C5A7A' }}>{d}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: '#5C5A7A' }}>This week</span>
        <span style={{ color: '#22C55E', fontFamily: 'Oxanium, sans-serif' }}>
          {Math.round(completionPct)}% complete
        </span>
      </div>
    </div>
  )
}

interface RecentCompletion {
  id: string
  habit_id: string
  completed_at: string
  xp_earned?: number
  habit?: {
    name: string
    emoji: string
    stat_category: string
    xp_reward: number
  }
}

export default function DashboardPage() {
  const { profile, stats, habits, completions_today, loading, refetch } = useProfile()
  const { completeHabit } = useCompleteHabit()
  const supabase = createClient()

  const [levelUpModal, setLevelUpModal] = useState(false)
  const [newLevel, setNewLevel] = useState(1)
  const [completedLocally, setCompletedLocally] = useState<string[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentCompletion[]>([])
  const [xpToday, setXpToday] = useState(0)

  const allCompleted = [...completions_today, ...completedLocally]

  // Fetch recent activity
  useEffect(() => {
    async function fetchActivity() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('habit_completions')
        .select('id, habit_id, completed_at, xp_earned, habits(name, emoji, stat_category, xp_reward)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5)

      if (data) {
        setRecentActivity(
          data.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            habit_id: d.habit_id as string,
            completed_at: d.completed_at as string,
            xp_earned: d.xp_earned as number | undefined,
            habit: d.habits as RecentCompletion['habit'],
          }))
        )
      }

      // XP today
      const todayStr = new Date().toISOString().split('T')[0]
      const { data: todayData } = await supabase
        .from('habit_completions')
        .select('xp_earned')
        .eq('user_id', user.id)
        .gte('completed_at', todayStr + 'T00:00:00')
        .lt('completed_at', todayStr + 'T23:59:59')

      if (todayData) {
        setXpToday(todayData.reduce((s: number, d: { xp_earned?: number }) => s + (d.xp_earned ?? 0), 0))
      }
    }
    if (!loading) fetchActivity()
  }, [loading, supabase])

  async function handleComplete(habitId: string) {
    if (allCompleted.includes(habitId)) return
    setCompletedLocally((prev) => [...prev, habitId])

    const result = await completeHabit(habitId)
    if (!result) {
      toast.error('Failed to complete quest')
      setCompletedLocally((prev) => prev.filter((id) => id !== habitId))
      return
    }

    const multiplierText = result.multiplier > 1 ? ` (${result.multiplier}x 🔥)` : ''
    toast.success(`+${result.xp_earned} XP ⚡ Quest Complete!${multiplierText}`, { duration: 3000 })

    if (result.leveled_up) {
      setNewLevel(result.new_level)
      setLevelUpModal(true)
    }

    refetch()
  }

  const completionPct = habits.length > 0 ? (allCompleted.length / habits.length) * 100 : 0

  // Best streak (just use profile streak for now, could be computed per-habit if DB supports it)
  const bestStreak = profile?.streak ?? 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚔️</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Loading your realm...
          </div>
        </div>
      </div>
    )
  }

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <>
      <div className="flex min-h-screen" style={{ background: '#08080F' }}>
        <Sidebar
          userAvatar={profile?.avatar_emoji ?? '⚔️'}
          userName={profile?.display_name ?? 'Adventurer'}
          userLevel={profile?.level ?? 1}
          completedToday={allCompleted.length}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ marginLeft: 240 }}>
          <div className="p-6 xl:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
              >
                Welcome back, {profile?.display_name ?? 'Adventurer'} 👋
              </h1>
              <p style={{ color: '#5C5A7A' }}>{dateStr}</p>
            </div>

            {/* Quick Stats row */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {[
                { icon: '⚡', label: 'XP Today', value: xpToday, color: '#7C3AED' },
                {
                  icon: '✅',
                  label: 'Quests Done',
                  value: `${allCompleted.length} / ${habits.length}`,
                  color: '#22C55E',
                },
                { icon: '🔥', label: 'Best Streak', value: `${bestStreak}d`, color: '#F59E0B' },
                { icon: '📅', label: 'Day Streak', value: `${profile?.streak ?? 0}d`, color: '#EC4899' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${stat.color}15` }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div
                      className="text-xl font-bold leading-tight"
                      style={{ fontFamily: 'Oxanium, sans-serif', color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs" style={{ color: '#5C5A7A' }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ── LEFT COLUMN: Character Card ── */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl p-6"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                {/* Avatar */}
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{profile?.avatar_emoji ?? '⚔️'}</div>
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
                  >
                    {profile?.display_name ?? 'Adventurer'}
                  </h2>
                  <span
                    className="inline-block mt-1 px-3 py-0.5 rounded-full text-sm font-semibold"
                    style={{ background: '#F59E0B22', color: '#F59E0B' }}
                  >
                    Level {profile?.level ?? 1}
                  </span>
                </div>

                {/* HP Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#9B99B8' }}>❤️ HP</span>
                    <span style={{ color: '#EF4444', fontFamily: 'Oxanium, sans-serif' }}>
                      {profile?.hp ?? 100}/{profile?.hp_max ?? 100}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #EF4444, #F87171)',
                        width: `${((profile?.hp ?? 100) / (profile?.hp_max ?? 100)) * 100}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((profile?.hp ?? 100) / (profile?.hp_max ?? 100)) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>

                {/* XP Bar */}
                <div className="mb-5">
                  <XPBar
                    currentXP={profile?.xp ?? 0}
                    maxXP={profile?.xp_to_next ?? 100}
                    level={profile?.level ?? 1}
                  />
                </div>

                {/* Stats */}
                <div className="space-y-2.5">
                  {STAT_CONFIG.map((s) => (
                    <StatBar
                      key={s.key}
                      icon={s.icon}
                      label={s.label}
                      value={stats ? (stats as unknown as Record<string, number>)[s.key] ?? 0 : 0}
                      maxValue={100}
                      color={s.color}
                    />
                  ))}
                </div>

                {/* Streak */}
                <div
                  className="mt-5 flex items-center justify-between p-3 rounded-xl"
                  style={{ background: '#0F0F1A', border: '1px solid #1E1E35' }}
                >
                  <span className="text-sm" style={{ color: '#9B99B8' }}>Daily Streak</span>
                  <span
                    className={`text-xl font-bold flex items-center gap-1 ${(profile?.streak ?? 0) > 0 ? 'fire-pulse' : ''}`}
                    style={{ fontFamily: 'Oxanium, sans-serif', color: '#F59E0B' }}
                  >
                    {(profile?.streak ?? 0) > 0 ? '🔥' : '💤'}
                    {profile?.streak ?? 0}
                  </span>
                </div>
              </motion.div>

              {/* ── CENTER COLUMN: Today's Quests ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-2xl p-6"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2
                    className="text-lg font-bold"
                    style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
                  >
                    Today&apos;s Quests
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#7C3AED22', color: '#9F67FF' }}>
                      {allCompleted.length}/{habits.length} done
                    </span>
                    <Link
                      href="/quests"
                      className="flex items-center gap-1 text-xs font-medium transition-colors"
                      style={{ color: '#7C3AED' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#9F67FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#7C3AED')}
                    >
                      View All <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                {habits.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🗺️</div>
                    <p className="text-sm" style={{ color: '#5C5A7A' }}>No quests yet!</p>
                    <Link
                      href="/quests"
                      className="inline-block mt-3 text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: '#7C3AED22', color: '#9F67FF' }}
                    >
                      Add your first quest →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {habits.slice(0, 5).map((habit) => (
                      <QuestCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={allCompleted.includes(habit.id)}
                        onComplete={handleComplete}
                      />
                    ))}
                    {habits.length > 5 && (
                      <Link
                        href="/quests"
                        className="block text-center text-xs py-2 rounded-lg transition-colors"
                        style={{ color: '#5C5A7A', border: '1px dashed #1E1E35' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#9F67FF')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#5C5A7A')}
                      >
                        +{habits.length - 5} more quests →
                      </Link>
                    )}
                  </div>
                )}

                {/* Progress */}
                {habits.length > 0 && (
                  <div className="mt-5">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#5C5A7A' }}>Daily progress</span>
                      <span style={{ color: '#22C55E' }}>{Math.round(completionPct)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #22C55E, #4ADE80)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* Recent Activity Feed */}
                {recentActivity.length > 0 && (
                  <div className="mt-6 pt-5 border-t" style={{ borderColor: '#1E1E35' }}>
                    <h3
                      className="text-sm font-bold mb-3"
                      style={{ fontFamily: 'Oxanium, sans-serif', color: '#9B99B8' }}
                    >
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {recentActivity.map((entry) => {
                        const catIcon = CATEGORY_ICONS[entry.habit?.stat_category ?? ''] ?? '📋'
                        return (
                          <div
                            key={entry.id}
                            className="flex items-center gap-2.5 py-1.5"
                          >
                            <span className="text-base w-6 text-center flex-shrink-0">
                              {entry.habit?.emoji ?? catIcon}
                            </span>
                            <span
                              className="text-xs flex-1 truncate"
                              style={{ color: '#C4C2D8' }}
                            >
                              {entry.habit?.name ?? 'Quest'}
                            </span>
                            <span
                              className="text-xs font-bold flex-shrink-0"
                              style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}
                            >
                              +{entry.xp_earned ?? entry.habit?.xp_reward ?? 0} XP
                            </span>
                            <span className="text-xs flex-shrink-0" style={{ color: '#5C5A7A' }}>
                              {timeAgo(entry.completed_at)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── RIGHT COLUMN: Stats Panel ── */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-5"
              >
                {/* Weekly heatmap */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                >
                  <WeekHeatmap completionPct={completionPct} />
                </div>

                {/* Active buffs */}
                {(profile?.streak ?? 0) >= 3 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl p-5"
                    style={{
                      background: '#13131F',
                      border: '1px solid #F59E0B44',
                      boxShadow: '0 0 20px #F59E0B11',
                    }}
                  >
                    <div className="text-sm font-semibold mb-2" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F59E0B' }}>
                      🔥 Active Buff
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl fire-pulse">🔥</div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#F1F0FF' }}>1.25× XP Multiplier</div>
                        <div className="text-xs" style={{ color: '#5C5A7A' }}>
                          {profile?.streak ?? 0}-day streak active
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick stats */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                >
                  <div className="text-sm font-semibold mb-4" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}>
                    Quick Stats
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Level',    value: profile?.level ?? 1,     icon: '⭐', color: '#F59E0B' },
                      { label: 'Streak',   value: `${profile?.streak ?? 0}d`, icon: '🔥', color: '#F59E0B' },
                      { label: 'Total XP', value: profile?.xp ?? 0,        icon: '⚡', color: '#7C3AED' },
                      { label: 'Quests',   value: habits.length,             icon: '📋', color: '#3B82F6' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-3 rounded-xl text-center"
                        style={{ background: '#0F0F1A', border: '1px solid #1E1E35' }}
                      >
                        <div className="text-lg">{stat.icon}</div>
                        <div
                          className="text-lg font-bold"
                          style={{ fontFamily: 'Oxanium, sans-serif', color: stat.color }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs" style={{ color: '#5C5A7A' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Go to AI Coach CTA */}
                <Link
                  href="/coach"
                  className="block rounded-2xl p-5 transition-all duration-200 group"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED11, #EC489911)',
                    border: '1px solid #7C3AED44',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7C3AED88'
                    e.currentTarget.style.boxShadow = '0 0 20px #7C3AED22'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#7C3AED44'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div className="flex-1">
                      <div
                        className="font-bold text-sm"
                        style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
                      >
                        AI Coach
                      </div>
                      <div className="text-xs" style={{ color: '#9B99B8' }}>
                        Get personalized advice
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: '#7C3AED' }} />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      <LevelUpModal
        isOpen={levelUpModal}
        newLevel={newLevel}
        onClose={() => setLevelUpModal(false)}
      />
    </>
  )
}
