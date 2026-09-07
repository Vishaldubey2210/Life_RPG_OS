'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Flame,
  Zap,
  Swords,
  BarChart2,
  Users,
  Star,
  Shield,
  Sparkles,
  Crown,
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

interface AchievementDef {
  key: string
  name: string
  description: string
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: string
  requirement_type: string
  requirement_value: number
  xp_reward: number
  is_hidden: boolean
}

interface EarnedAchievement {
  achievement_key: string
  earned_at: string
}

type FilterTab = 'all' | 'streaks' | 'xp' | 'quests' | 'stats' | 'social' | 'special' | 'hidden'

const RARITY_CONFIG = {
  common:    { label: 'Common',    color: '#9B99B8', bg: '#9B99B815', border: '#3E3E5A',   glow: 'none',                       Icon: Shield },
  rare:      { label: 'Rare',      color: '#3B82F6', bg: '#3B82F615', border: '#3B82F644', glow: '0 0 20px #3B82F622',         Icon: Zap },
  epic:      { label: 'Epic',      color: '#7C3AED', bg: '#7C3AED15', border: '#7C3AED55', glow: '0 0 25px #7C3AED33',         Icon: Sparkles },
  legendary: { label: 'Legendary', color: '#F59E0B', bg: '#F59E0B10', border: '#F59E0B55', glow: '0 0 30px #F59E0B33',         Icon: Crown },
}

const CATEGORY_TABS: Array<{ key: FilterTab; label: string; Icon: React.ComponentType<{ size?: number }> }> = [
  { key: 'all',      label: 'All',      Icon: Trophy },
  { key: 'streaks',  label: 'Streaks',  Icon: Flame },
  { key: 'xp',       label: 'XP',       Icon: Zap },
  { key: 'quests',   label: 'Quests',   Icon: Swords },
  { key: 'stats',    label: 'Stats',    Icon: BarChart2 },
  { key: 'social',   label: 'Social',   Icon: Users },
  { key: 'special',  label: 'Special',  Icon: Star },
  { key: 'hidden',   label: 'Hidden',   Icon: Lock },
]

function getRequirementHint(def: AchievementDef, totalQuests: number, profile: { level: number; streak: number; xp: number } | null): { text: string; progress: number; max: number } | null {
  if (def.requirement_type === 'quests_completed') {
    return { text: `${Math.min(totalQuests, def.requirement_value)} / ${def.requirement_value} quests`, progress: totalQuests, max: def.requirement_value }
  }
  if (def.requirement_type === 'streak_days' && profile) {
    return { text: `${Math.min(profile.streak, def.requirement_value)} / ${def.requirement_value} days streak`, progress: profile.streak, max: def.requirement_value }
  }
  if (def.requirement_type === 'total_xp' && profile) {
    return { text: `${Math.min(profile.xp, def.requirement_value)} / ${def.requirement_value} XP`, progress: profile.xp, max: def.requirement_value }
  }
  if (def.requirement_type === 'level_reached' && profile) {
    return { text: `Level ${profile.level} / ${def.requirement_value}`, progress: profile.level, max: def.requirement_value }
  }
  return null
}

export default function AchievementsPage() {
  const { profile, loading } = useProfile()
  const supabase = createClient()
  const [defs, setDefs] = useState<AchievementDef[]>([])
  const [earned, setEarned] = useState<EarnedAchievement[]>([])
  const [totalQuests, setTotalQuests] = useState(0)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!profile?.id) return
      setDataLoading(true)
      try {
        const [defsRes, earnedRes, questsRes] = await Promise.all([
          supabase.from('achievement_definitions').select('*').order('rarity'),
          supabase.from('user_achievements').select('achievement_key, earned_at').eq('user_id', profile.id),
          supabase.from('habit_completions').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        ])
        if (defsRes.data) setDefs(defsRes.data as AchievementDef[])
        if (earnedRes.data) setEarned(earnedRes.data as EarnedAchievement[])
        setTotalQuests(questsRes.count ?? 0)
      } finally {
        setDataLoading(false)
      }
    }
    if (!loading) fetchData()
  }, [profile?.id, loading])

  const earnedKeys = new Set(earned.map(e => e.achievement_key))
  const earnedMap = new Map(earned.map(e => [e.achievement_key, e.earned_at]))

  // Rarity breakdown
  const rarityStats = (['common', 'rare', 'epic', 'legendary'] as const).map(r => ({
    rarity: r,
    total: defs.filter(d => d.rarity === r).length,
    earned: defs.filter(d => d.rarity === r && earnedKeys.has(d.key)).length,
  }))

  const totalXPFromAchievements = defs
    .filter(d => earnedKeys.has(d.key))
    .reduce((s, d) => s + d.xp_reward, 0)

  // Next to unlock (closest progress)
  const nextToUnlock = defs
    .filter(d => !earnedKeys.has(d.key) && !d.is_hidden)
    .slice(0, 3)

  // Filter
  const filteredDefs = defs.filter(d => {
    if (filter === 'hidden') return d.is_hidden
    if (filter === 'all') return true
    return d.category === filter
  })

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="flex justify-center mb-4" style={{ animation: 'burst-in 0.5s ease' }}>
            <Trophy className="w-12 h-12 text-amber-400" />
          </div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Loading Achievement Hall...
          </div>
        </div>
      </div>
    )
  }

  if (defs.length === 0) {
    return (
      <div className="flex min-h-screen" style={{ background: '#08080F' }}>
        <Sidebar
          userAvatar={profile?.avatar_emoji ?? 'swords'}
          userName={profile?.display_name ?? 'Adventurer'}
          userLevel={profile?.level ?? 1}
        />
        <main className="flex-1 flex items-center justify-center" style={{ marginLeft: 240 }}>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
              No achievements yet
            </h2>
            <p className="text-sm mb-4" style={{ color: '#5C5A7A' }}>
              Run <code className="text-purple-400">supabase-day4.sql</code> in your Supabase SQL Editor to enable the achievement system.
            </p>
            <Link href="/dashboard" className="text-sm px-4 py-2 rounded-xl" style={{ background: '#7C3AED22', color: '#9F67FF' }}>
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#08080F' }}>
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? 'swords'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto" style={{ marginLeft: 240 }}>
        <div className="p-6 xl:p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 font-display flex items-center gap-3" style={{ color: '#F1F0FF' }}>
              <span>Achievement Hall</span>
              <Trophy className="w-8 h-8 text-amber-400 inline" />
            </h1>
            <p style={{ color: '#9B99B8' }}>
              {earnedKeys.size} of {defs.length} achievements unlocked
            </p>

            <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7C3AED, #F59E0B)' }}
                initial={{ width: 0 }}
                animate={{ width: `${defs.length > 0 ? (earnedKeys.size / defs.length) * 100 : 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORY_TABS.map(cat => {
              const Icon = cat.Icon
              const count = cat.key === 'all' ? defs.length : defs.filter(d => d.category === cat.key).length
              const earnedCount = cat.key === 'all'
                ? earnedKeys.size
                : defs.filter(d => d.category === cat.key && earnedKeys.has(d.key)).length
              const isSelected = filter === cat.key

              return (
                <button
                  key={cat.key}
                  onClick={() => setFilter(cat.key)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200"
                  style={{
                    background: isSelected ? '#7C3AED22' : '#13131F',
                    border: isSelected ? '1px solid #7C3AED' : '1px solid #1E1E35',
                    color: isSelected ? '#F1F0FF' : '#5C5A7A',
                  }}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      background: isSelected ? '#7C3AED44' : '#1E1E35',
                      color: isSelected ? '#F1F0FF' : '#5C5A7A',
                      fontFamily: 'Oxanium, sans-serif',
                      fontSize: 10,
                    }}
                  >
                    {earnedCount}/{count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredDefs.map((def, idx) => {
                    const isUnlocked = earnedKeys.has(def.key)
                    const earnedDate = earnedMap.get(def.key)
                    const cfg = RARITY_CONFIG[def.rarity]
                    const isLegendary = def.rarity === 'legendary'

                    return (
                      <motion.div
                        key={def.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`relative p-4 rounded-2xl border overflow-hidden transition-all duration-300 ${isLegendary && isUnlocked ? 'legendary-card' : ''}`}
                        style={{
                          background: isUnlocked ? cfg.bg : '#13131F',
                          borderColor: isUnlocked ? cfg.border : '#1E1E35',
                          boxShadow: isUnlocked ? cfg.glow : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{
                              background: cfg.bg,
                              color: cfg.color,
                              fontFamily: 'Oxanium, sans-serif',
                              border: `1px solid ${cfg.border}`,
                            }}
                          >
                            <cfg.Icon size={11} /> {cfg.label}
                          </span>
                          {isUnlocked && <CheckCircle2 size={14} style={{ color: '#22C55E' }} />}
                        </div>

                        <div className="relative inline-block mb-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl"
                            style={{
                              filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.5)',
                              color: cfg.color,
                            }}
                          >
                            <DynamicIcon name={def.emoji} size={32} />
                          </div>
                          {!isUnlocked && (
                            <div
                              className="absolute inset-0 flex items-center justify-center rounded-lg"
                              style={{ background: 'rgba(8,8,15,0.6)' }}
                            >
                              <Lock size={14} style={{ color: '#5C5A7A' }} />
                            </div>
                          )}
                        </div>

                        <div className="font-bold text-sm mb-1 font-display" style={{ color: isUnlocked ? '#F1F0FF' : '#9B99B8' }}>
                          {def.name}
                        </div>
                        <div className="text-xs mb-3" style={{ color: '#5C5A7A' }}>
                          {def.is_hidden && !isUnlocked ? '???' : def.description}
                        </div>

                        <div className="flex items-end justify-between gap-2">
                          <div className="text-xs" style={{ color: '#5C5A7A' }}>
                            {isUnlocked && earnedDate ? `Earned ${new Date(earnedDate).toLocaleDateString()}` : ''}
                          </div>
                          <span
                            className="text-xs font-bold flex-shrink-0 flex items-center gap-1"
                            style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}
                          >
                            <Zap size={11} />+{def.xp_reward}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden xl:flex flex-col gap-4" style={{ width: 260 }}>
              <div className="p-5 rounded-2xl border" style={{ background: '#13131F', borderColor: '#1E1E35' }}>
                <div className="text-sm font-bold mb-4 font-display" style={{ color: '#F1F0FF' }}>Rarity Breakdown</div>
                <div className="space-y-3">
                  {rarityStats.map(r => {
                    const cfg = RARITY_CONFIG[r.rarity]
                    const IconComp = cfg.Icon
                    return (
                      <div key={r.rarity}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5" style={{ color: cfg.color }}>
                            <IconComp size={12} />
                            <span>{cfg.label}</span>
                          </span>
                          <span style={{ color: '#9B99B8', fontFamily: 'Oxanium, sans-serif' }}>{r.earned}/{r.total}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: cfg.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${r.total > 0 ? (r.earned / r.total) * 100 : 0}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl border text-center" style={{ background: '#13131F', borderColor: '#F59E0B22' }}>
                <div className="text-3xl font-bold mb-1 font-display" style={{ color: '#F59E0B' }}>
                  {totalXPFromAchievements.toLocaleString()}
                </div>
                <div className="text-xs flex items-center justify-center gap-1" style={{ color: '#5C5A7A' }}>
                  <Zap size={12} className="text-amber-400" /> Total XP from Badges
                </div>
              </div>

              {nextToUnlock.length > 0 && (
                <div className="p-5 rounded-2xl border" style={{ background: '#13131F', borderColor: '#1E1E35' }}>
                  <div className="text-sm font-bold mb-3 font-display" style={{ color: '#F1F0FF' }}>Next to Unlock</div>
                  <div className="space-y-3">
                    {nextToUnlock.map(def => {
                      const cfg = RARITY_CONFIG[def.rarity]
                      return (
                        <div key={def.key} className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: `${cfg.color}15`, color: cfg.color }}
                          >
                            <DynamicIcon name={def.emoji} size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate" style={{ color: '#F1F0FF' }}>{def.name}</div>
                            <div className="text-xs" style={{ color: cfg.color, fontSize: 10 }}>{cfg.label}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
