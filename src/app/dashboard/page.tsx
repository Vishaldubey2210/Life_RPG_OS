'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import StatBar from '@/components/ui/StatBar'
import XPBar from '@/components/ui/XPBar'
import QuestCard from '@/components/ui/QuestCard'
import LevelUpModal from '@/components/ui/LevelUpModal'
import { useProfile } from '@/hooks/useProfile'
import { useCompleteHabit } from '@/hooks/useCompleteHabit'

const STAT_CONFIG = [
  { key: 'str',  label: 'STR',  icon: '💪', color: '#EF4444' },
  { key: 'int',  label: 'INT',  icon: '🧠', color: '#3B82F6' },
  { key: 'wis',  label: 'WIS',  icon: '🧘', color: '#22C55E' },
  { key: 'vit',  label: 'VIT',  icon: '❤️', color: '#EF4444' },
  { key: 'gold', label: 'GOLD', icon: '💰', color: '#F59E0B' },
  { key: 'cha',  label: 'CHA',  icon: '🗣️', color: '#9F67FF' },
]

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

export default function DashboardPage() {
  const { profile, stats, habits, completions_today, loading, refetch } = useProfile()
  const { completeHabit } = useCompleteHabit()
  const [levelUpModal, setLevelUpModal] = useState(false)
  const [newLevel, setNewLevel] = useState(1)
  const [completedLocally, setCompletedLocally] = useState<string[]>([])

  const allCompleted = [...completions_today, ...completedLocally]

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
    toast.success(`+${result.xp_earned} XP ⚡ Quest Complete!${multiplierText}`, {
      duration: 3000,
    })

    if (result.leveled_up) {
      setNewLevel(result.new_level)
      setLevelUpModal(true)
    }

    refetch()
  }

  const completionPct =
    habits.length > 0 ? (allCompleted.length / habits.length) * 100 : 0

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
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#7C3AED22', color: '#9F67FF' }}>
                    {allCompleted.length}/{habits.length} done
                  </span>
                </div>

                {habits.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🗺️</div>
                    <p className="text-sm" style={{ color: '#5C5A7A' }}>
                      No quests yet!
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#5C5A7A' }}>
                      Go to Quests to add some
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {habits.map((habit) => (
                      <QuestCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={allCompleted.includes(habit.id)}
                        onComplete={handleComplete}
                      />
                    ))}
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
                      { label: 'Level', value: profile?.level ?? 1, icon: '⭐', color: '#F59E0B' },
                      { label: 'Streak', value: `${profile?.streak ?? 0}d`, icon: '🔥', color: '#F59E0B' },
                      { label: 'Total XP', value: profile?.xp ?? 0, icon: '⚡', color: '#7C3AED' },
                      { label: 'Quests', value: habits.length, icon: '📋', color: '#3B82F6' },
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
