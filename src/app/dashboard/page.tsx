'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  Trophy,
  Dumbbell,
  Brain,
  Wind,
  Heart,
  Coins,
  Mic2,
  Zap,
  CheckCircle2,
  Flame,
  CalendarDays,
  Star,
  ClipboardList,
  Map,
  Swords,
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import StatBar from '@/components/ui/StatBar'
import XPBar from '@/components/ui/XPBar'
import QuestCard from '@/components/ui/QuestCard'
import LevelUpScreen from '@/components/ui/LevelUpScreen'
import HPBar from '@/components/ui/HPBar'
import StreakDisplay from '@/components/ui/StreakDisplay'
import PerfectDayBanner from '@/components/ui/PerfectDayBanner'
import AchievementUnlockModal, { NewAchievement } from '@/components/achievements/AchievementUnlockModal'
import { DailyCheckinCard } from '@/components/dashboard/DailyCheckinCard'
import { WeeklyChallengeCard } from '@/components/dashboard/WeeklyChallengeCard'
import { useProfile } from '@/hooks/useProfile'
import { useCompleteHabit } from '@/hooks/useCompleteHabit'
import { createClient } from '@/lib/supabase/client'

const STAT_CONFIG = [
  { key: 'str',  label: 'STR',  icon: Dumbbell,  color: '#EF4444' },
  { key: 'int',  label: 'INT',  icon: Brain,     color: '#3B82F6' },
  { key: 'wis',  label: 'WIS',  icon: Wind,      color: '#8B5CF6' },
  { key: 'vit',  label: 'VIT',  icon: Heart,     color: '#10B981' },
  { key: 'gold', label: 'GOLD', icon: Coins,     color: '#D97706' },
  { key: 'cha',  label: 'CHA',  icon: Mic2,      color: '#EC4899' },
]

const CATEGORY_ICON_COMPONENTS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  str: Dumbbell, int: Brain, wis: Wind, vit: Heart, gold: Coins, cha: Mic2,
}
const CATEGORY_ICON_COLORS: Record<string, string> = {
  str: '#EF4444', int: '#3B82F6', wis: '#8B5CF6', vit: '#10B981', gold: '#D97706', cha: '#EC4899',
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
  const opacities = [0.25, 0.45, 0.35, 0.6, 0.4, 0.7, 0.3]

  return (
    <div>
      <div className="text-xs mb-2.5 font-bold" style={{ color: '#232019' }}>7-Day Activity</div>
      <div className="flex gap-2 mb-3">
        {days.map((d, i) => {
          const isPast = i <= adjustedToday
          const isToday = i === adjustedToday
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className="w-full aspect-square rounded-lg transition-all duration-200"
                style={{
                  background: isToday
                    ? '#5B57F0'
                    : isPast
                    ? `rgba(91, 87, 240, ${opacities[i % opacities.length]})`
                    : '#F0EDE6',
                  border: isToday ? '1px solid #4338CA' : '1px solid transparent',
                  boxShadow: isToday ? '0 2px 8px rgba(91, 87, 240, 0.25)' : 'none',
                }}
              />
              <span className="text-[11px] font-semibold" style={{ color: isToday ? '#5B57F0' : '#8A857A' }}>{d}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between text-xs pt-1 border-t" style={{ borderColor: '#EAE6DD' }}>
        <span style={{ color: '#8A857A' }}>Weekly Goal</span>
        <span style={{ color: '#059669', fontWeight: 700 }}>
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
  const [pendingAchievements, setPendingAchievements] = useState<NewAchievement[]>([])
  const [showPerfectDay, setShowPerfectDay] = useState(false)
  const [recentBadges, setRecentBadges] = useState<{ key: string; name: string; emoji: string; rarity: string; earned_at: string }[]>([])

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

  // Fetch recent achievements
  useEffect(() => {
    async function fetchBadges() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_key, earned_at, achievement_definitions(name, emoji, rarity)')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(3)
      if (data) {
        setRecentBadges(data.map((d: Record<string, unknown>) => {
          const def = d.achievement_definitions as { name: string; emoji: string; rarity: string } | null
          return {
            key: d.achievement_key as string,
            name: def?.name ?? '',
            emoji: def?.emoji ?? 'trophy',
            rarity: def?.rarity ?? 'common',
            earned_at: d.earned_at as string,
          }
        }))
      }
    }
    if (!loading) fetchBadges()
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

    const multiplierText = result.multiplier > 1 ? ` (${result.multiplier}x Streak Bonus)` : ''
    toast.success(`+${result.xp_earned} XP Quest Complete!${multiplierText}`, { duration: 3000 })

    if (result.leveled_up) {
      setNewLevel(result.new_level)
      setLevelUpModal(true)
    }

    if (result.new_achievements && result.new_achievements.length > 0) {
      setPendingAchievements(result.new_achievements)
    }

    refetch()

    // Check perfect day
    const newCompleted = [...allCompleted, habitId]
    if (habits.length > 0 && newCompleted.length >= habits.length) {
      setShowPerfectDay(true)
    }
  }

  const completionPct = habits.length > 0 ? (allCompleted.length / habits.length) * 100 : 0
  const bestStreak = profile?.streak ?? 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#FBFAF7' }}>
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
            style={{ background: 'linear-gradient(135deg, #5B57F0, #4338CA)', boxShadow: '0 8px 24px rgba(91, 87, 240, 0.3)' }}
          >
            <Swords size={28} color="#FFFFFF" />
          </div>
          <div className="text-sm font-semibold" style={{ color: '#6E6A61', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            Loading your adventurer realm...
          </div>
        </div>
      </div>
    )
  }

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <>
      <div
        className="flex min-h-screen"
        style={{
          backgroundColor: '#FBFAF7',
          color: '#232019',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <Sidebar
          userAvatar={profile?.avatar_emoji ?? '⚔️'}
          userName={profile?.display_name ?? 'Adventurer'}
          userLevel={profile?.level ?? 1}
          completedToday={allCompleted.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto" style={{ marginLeft: 240 }}>
          <div className="p-6 xl:p-8 max-w-7xl mx-auto">
            
            {/* Top Greeting Header */}
            <div className="mb-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#232019] flex items-center gap-2.5">
                  <span>Welcome back, {profile?.display_name ?? 'Adventurer'}</span>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#EDECFD] text-[#5B57F0] text-base shadow-sm">
                    ⚔️
                  </span>
                </h1>
                <p className="text-sm font-medium text-[#8A857A] mt-1">{dateStr}</p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/quests"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B57F0] hover:bg-[#4F46E5] transition-all shadow-sm no-underline"
                >
                  <Zap size={14} />
                  <span>New Daily Quest</span>
                </Link>
              </div>
            </div>

            {/* Daily Check-in + Weekly Challenge Cards */}
            {profile?.id && (
              <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DailyCheckinCard userId={profile.id} />
                <WeeklyChallengeCard userId={profile.id} />
              </div>
            )}

            {/* 4 Top Quick Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7"
            >
              {[
                { Icon: Zap,           label: 'XP Today',    value: `+${xpToday}`,                       bg: '#EDECFD', color: '#5B57F0' },
                { Icon: CheckCircle2,  label: 'Quests Done', value: `${allCompleted.length} / ${habits.length}`, bg: '#ECFDF5', color: '#059669' },
                { Icon: Flame,         label: 'Best Streak', value: `${bestStreak}d`,                     bg: '#FEF3C7', color: '#D97706' },
                { Icon: CalendarDays,  label: 'Day Streak',  value: `${profile?.streak ?? 0}d`,           bg: '#FFEDD5', color: '#EA580C' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-4 flex items-center gap-3.5 bg-white border border-[#EAE6DD] shadow-sm"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: stat.bg, color: stat.color }}
                  >
                    <stat.Icon size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black leading-tight text-[#232019]">
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold text-[#8A857A] mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Main 3-Column Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ── LEFT COLUMN: Hero Character Sheet ── */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl p-6 bg-white border border-[#EAE6DD] shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Hero Character Profile Header */}
                  <div className="text-center mb-5">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-4xl shadow-sm bg-[#EDECFD] border border-[#D6D3FA]"
                    >
                      {profile?.avatar_emoji ? (
                        <span>{profile.avatar_emoji}</span>
                      ) : (
                        <Swords size={36} className="text-[#5B57F0]" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-[#232019]">
                      {profile?.display_name ?? 'Adventurer'}
                    </h2>
                    <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                      Level {profile?.level ?? 1}
                    </span>
                  </div>

                  {/* HP Bar */}
                  <div className="mb-4">
                    <HPBar
                      hp={profile?.hp ?? 100}
                      hpMax={profile?.hp_max ?? 100}
                      showFloatUp
                    />
                  </div>

                  {/* XP Bar */}
                  <div className="mb-5">
                    <XPBar
                      currentXP={profile?.xp ?? 0}
                      maxXP={profile?.xp_to_next ?? 100}
                      level={profile?.level ?? 1}
                    />
                  </div>

                  {/* Stat Attribute Bars */}
                  <div className="space-y-2.5 pt-2 border-t border-[#EAE6DD]">
                    <div className="text-xs font-bold text-[#8A857A] uppercase tracking-wider mb-2">Attribute Matrix</div>
                    {STAT_CONFIG.map((s) => (
                      <StatBar
                        key={s.key}
                        icon={<s.icon size={14} color={s.color} />}
                        label={s.label}
                        value={stats ? (stats as unknown as Record<string, number>)[s.key] ?? 0 : 0}
                        maxValue={100}
                        color={s.color}
                      />
                    ))}
                  </div>
                </div>

                {/* Streak Box */}
                <div className="mt-6 pt-4 border-t border-[#EAE6DD]">
                  <StreakDisplay streak={profile?.streak ?? 0} />
                </div>
              </motion.div>

              {/* ── CENTER COLUMN: Today's Quests ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="rounded-2xl p-6 bg-white border border-[#EAE6DD] shadow-sm flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#232019]">
                    Today&apos;s Quests
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#EDECFD] text-[#5B57F0]">
                      {allCompleted.length}/{habits.length} done
                    </span>
                    <Link
                      href="/quests"
                      className="flex items-center gap-1 text-xs font-bold text-[#5B57F0] hover:text-[#4338CA] transition-colors no-underline"
                    >
                      View All <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                {habits.length === 0 ? (
                  <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-[#FAF8F5] border border-[#EAE6DD] text-[#8A857A]">
                      <Map size={24} />
                    </div>
                    <p className="text-sm font-semibold text-[#6E6A61]">No quests initialized yet!</p>
                    <Link
                      href="/quests"
                      className="inline-block mt-3 text-xs font-bold px-4 py-2 rounded-xl bg-[#5B57F0] text-white hover:bg-[#4F46E5] transition-colors shadow-sm no-underline"
                    >
                      Add your first quest →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5 flex-1">
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
                        className="block text-center text-xs font-bold py-2.5 rounded-xl transition-colors text-[#6E6A61] bg-[#FAF8F5] border border-[#EAE6DD] hover:text-[#5B57F0] no-underline"
                      >
                        +{habits.length - 5} more quests →
                      </Link>
                    )}
                  </div>
                )}

                {/* Daily Progress Fill */}
                {habits.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#EAE6DD]">
                    <div className="flex justify-between text-xs mb-1.5 font-semibold">
                      <span className="text-[#8A857A]">Daily Quest Completion</span>
                      <span className="text-[#059669] font-bold">{Math.round(completionPct)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-[#EAE6DD]">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* Recent Activity Feed */}
                {recentActivity.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#EAE6DD]">
                    <h3 className="text-xs font-bold text-[#8A857A] uppercase tracking-wider mb-3">
                      Recent Activity
                    </h3>
                    <div className="space-y-2">
                      {recentActivity.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DD]"
                        >
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs"
                            style={{
                              backgroundColor: (CATEGORY_ICON_COLORS[entry.habit?.stat_category ?? ''] ?? '#5B57F0') + '20',
                              color: CATEGORY_ICON_COLORS[entry.habit?.stat_category ?? ''] ?? '#5B57F0',
                            }}
                          >
                            {entry.habit?.emoji ? (
                              <span>{entry.habit.emoji}</span>
                            ) : (
                              (() => {
                                const IconComp = CATEGORY_ICON_COMPONENTS[entry.habit?.stat_category ?? ''] ?? ClipboardList
                                return <IconComp size={12} />
                              })()
                            )}
                          </div>
                          <span className="text-xs font-semibold flex-1 truncate text-[#232019]">
                            {entry.habit?.name ?? 'Quest'}
                          </span>
                          <span className="text-xs font-bold flex-shrink-0 text-[#5B57F0]">
                            +{entry.xp_earned ?? entry.habit?.xp_reward ?? 0} XP
                          </span>
                          <span className="text-[11px] font-medium flex-shrink-0 text-[#8A857A]">
                            {timeAgo(entry.completed_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── RIGHT COLUMN: Activity, Badges & AI Coach ── */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="space-y-5"
              >
                {/* Recent Achievements Widget */}
                {recentBadges.length > 0 && (
                  <div className="rounded-2xl p-5 bg-white border border-[#EAE6DD] shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-[#D97706]" />
                        <span className="text-sm font-bold text-[#232019]">Recent Badges</span>
                      </div>
                      <Link
                        href="/achievements"
                        className="text-xs font-bold text-[#5B57F0] hover:underline no-underline"
                      >
                        See All →
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {recentBadges.map((badge) => (
                        <div key={badge.key} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD]">
                          <span className="text-xl">{badge.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate text-[#232019]">{badge.name}</div>
                            <div className="text-[11px] text-[#8A857A]">{new Date(badge.earned_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7-Day Activity Heatmap */}
                <div className="rounded-2xl p-5 bg-white border border-[#EAE6DD] shadow-sm">
                  <WeekHeatmap completionPct={completionPct} />
                </div>

                {/* Active Streak Buff */}
                {(profile?.streak ?? 0) >= 3 && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl p-5 bg-[#FEF3C7] border border-[#FDE68A] shadow-sm"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[#B45309]">
                      <Flame size={14} />
                      Active Streak Buff
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-[#FDE68A] text-[#D97706] shadow-sm">
                        <Flame size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-[#92400E]">1.25× XP Multiplier</div>
                        <div className="text-xs font-medium text-[#B45309]">
                          {profile?.streak ?? 0}-day momentum active
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Stats Grid */}
                <div className="rounded-2xl p-5 bg-white border border-[#EAE6DD] shadow-sm">
                  <div className="text-xs font-bold text-[#8A857A] uppercase tracking-wider mb-3">
                    Overview Stats
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: 'Level',    value: profile?.level ?? 1,     Icon: Star,          bg: '#FEF3C7', color: '#D97706' },
                      { label: 'Streak',   value: `${profile?.streak ?? 0}d`, Icon: Flame,     bg: '#FFEDD5', color: '#EA580C' },
                      { label: 'Total XP', value: profile?.xp ?? 0,        Icon: Zap,          bg: '#EDECFD', color: '#5B57F0' },
                      { label: 'Quests',   value: habits.length,             Icon: ClipboardList, bg: '#ECFDF5', color: '#059669' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-3 rounded-xl text-center bg-[#FAF8F5] border border-[#EAE6DD]"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                          style={{ backgroundColor: stat.bg, color: stat.color }}
                        >
                          <stat.Icon size={14} />
                        </div>
                        <div className="text-base font-extrabold text-[#232019]">
                          {stat.value}
                        </div>
                        <div className="text-[11px] font-semibold text-[#8A857A]">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      <LevelUpScreen
        isOpen={levelUpModal}
        newLevel={newLevel}
        onClose={() => setLevelUpModal(false)}
      />
      <PerfectDayBanner
        show={showPerfectDay}
        onDismiss={() => setShowPerfectDay(false)}
      />
      <AchievementUnlockModal
        achievements={pendingAchievements}
        onAllDismissed={() => setPendingAchievements([])}
      />
    </>
  )
}
