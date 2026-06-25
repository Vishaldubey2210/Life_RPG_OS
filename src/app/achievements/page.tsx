'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, CheckCircle2, ChevronRight, Trophy } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
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
  common:    { label: 'Common',    color: '#9B99B8', bg: '#9B99B815', border: '#3E3E5A',   glow: 'none',                       icon: '⚪' },
  rare:      { label: 'Rare',      color: '#3B82F6', bg: '#3B82F615', border: '#3B82F644', glow: '0 0 20px #3B82F622',         icon: '🔵' },
  epic:      { label: 'Epic',      color: '#7C3AED', bg: '#7C3AED15', border: '#7C3AED55', glow: '0 0 25px #7C3AED33',         icon: '🟣' },
  legendary: { label: 'Legendary', color: '#F59E0B', bg: '#F59E0B10', border: '#F59E0B55', glow: '0 0 30px #F59E0B33',         icon: '🟡' },
}

const CATEGORY_LABELS: Record<string, string> = {
  all: '🏆 All', streaks: '🔥 Streaks', xp: '⚡ XP', quests: '⚔️ Quests',
  stats: '📊 Stats', social: '👥 Social', special: '⭐ Special', hidden: '🔒 Hidden',
}

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
  const earnedMap = Object.fromEntries(earned.map(e => [e.achievement_key, e.earned_at]))

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
          <div className="text-5xl mb-4" style={{ animation: 'burst-in 0.5s ease' }}>🏆</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Loading Achievement Hall...
          </div>
        </div>
      </div>
    )
  }

  // Empty state — no achievement definitions in DB yet
  if (defs.length === 0) {
    return (
      <div className="flex min-h-screen" style={{ background: '#08080F' }}>
        <Sidebar
          userAvatar={profile?.avatar_emoji ?? '⚔️'}
          userName={profile?.display_name ?? 'Adventurer'}
          userLevel={profile?.level ?? 1}
        />
        <main className="flex-1 flex items-center justify-center" style={{ marginLeft: 240 }}>
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
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
        userAvatar={profile?.avatar_emoji ?? '⚔️'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto" style={{ marginLeft: 240 }}>
        <div className="p-6 xl:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
              Achievement Hall 🏆
            </h1>
            <p style={{ color: '#9B99B8' }}>
              {earnedKeys.size} of {defs.length} achievements unlocked
            </p>

            {/* Progress bar */}
            <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7C3AED, #F59E0B)' }}
                initial={{ width: 0 }}
                animate={{ width: `${defs.length > 0 ? (earnedKeys.size / defs.length) * 100 : 0}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1" style={{ color: '#5C5A7A' }}>
              <span>0</span>
              <span style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}>
                {Math.round(defs.length > 0 ? (earnedKeys.size / defs.length) * 100 : 0)}%
              </span>
              <span>{defs.length}</span>
            </div>
          </motion.div>

          <div className="flex gap-6">
            {/* Left: Grid */}
            <div className="flex-1 min-w-0">
              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(Object.keys(CATEGORY_LABELS) as FilterTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{
                      background: filter === tab ? '#7C3AED' : '#13131F',
                      color: filter === tab ? '#fff' : '#9B99B8',
                      border: `1px solid ${filter === tab ? '#7C3AED' : '#1E1E35'}`,
                      fontFamily: 'Oxanium, sans-serif',
                    }}
                  >
                    {CATEGORY_LABELS[tab]}
                  </button>
                ))}
              </div>

              {/* Achievement grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredDefs.map((def, idx) => {
                    const isUnlocked = earnedKeys.has(def.key)
                    const cfg = RARITY_CONFIG[def.rarity]
                    const isLegendary = def.rarity === 'legendary'
                    const earnedDate = earnedMap[def.key]
                    const hint = !isUnlocked ? getRequirementHint(def, totalQuests, profile ? { level: profile.level, streak: profile.streak, xp: profile.xp } : null) : null

                    return (
                      <motion.div
                        key={def.key}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`relative p-4 rounded-2xl border overflow-hidden transition-all duration-300 ${isLegendary && isUnlocked ? 'legendary-card' : ''}`}
                        style={{
                          background: isUnlocked ? cfg.bg : '#13131F',
                          borderColor: isUnlocked ? cfg.border : '#1E1E35',
                          boxShadow: isUnlocked ? cfg.glow : 'none',
                          filter: isUnlocked ? 'none' : 'opacity(0.65)',
                        }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                      >
                        {/* Rarity label */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: cfg.bg,
                              color: cfg.color,
                              fontFamily: 'Oxanium, sans-serif',
                              border: `1px solid ${cfg.border}`,
                            }}
                          >
                            {cfg.icon} {cfg.label}
                          </span>
                          {isUnlocked && (
                            <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                          )}
                        </div>

                        {/* Emoji + locked overlay */}
                        <div className="relative inline-block mb-3">
                          <div
                            className="text-4xl"
                            style={{ filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}
                          >
                            {def.emoji}
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

                        {/* Name */}
                        <div
                          className="font-bold text-sm mb-1 font-display"
                          style={{ color: isUnlocked ? '#F1F0FF' : '#9B99B8' }}
                        >
                          {def.name}
                        </div>

                        {/* Description */}
                        <div className="text-xs mb-3" style={{ color: '#5C5A7A' }}>
                          {def.is_hidden && !isUnlocked ? '???' : def.description}
                        </div>

                        {/* Bottom row */}
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            {isUnlocked && earnedDate ? (
                              <div className="text-xs" style={{ color: '#5C5A7A' }}>
                                Earned {new Date(earnedDate).toLocaleDateString()}
                              </div>
                            ) : hint ? (
                              <div className="w-32">
                                <div className="text-xs mb-1" style={{ color: '#5C5A7A' }}>{hint.text}</div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${Math.min(100, (hint.progress / hint.max) * 100)}%`,
                                      background: cfg.color,
                                    }}
                                  />
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <span
                            className="text-xs font-bold flex-shrink-0"
                            style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}
                          >
                            ⚡+{def.xp_reward}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="hidden xl:flex flex-col gap-4" style={{ width: 260 }}>
              {/* Rarity breakdown */}
              <div
                className="p-5 rounded-2xl border"
                style={{ background: '#13131F', borderColor: '#1E1E35' }}
              >
                <div className="text-sm font-bold mb-4 font-display" style={{ color: '#F1F0FF' }}>
                  Rarity Breakdown
                </div>
                <div className="space-y-3">
                  {rarityStats.map(r => {
                    const cfg = RARITY_CONFIG[r.rarity]
                    return (
                      <div key={r.rarity}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                          <span style={{ color: '#9B99B8', fontFamily: 'Oxanium, sans-serif' }}>
                            {r.earned}/{r.total}
                          </span>
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

              {/* Total XP from achievements */}
              <div
                className="p-5 rounded-2xl border text-center"
                style={{ background: '#13131F', borderColor: '#F59E0B22' }}
              >
                <div className="text-3xl font-bold mb-1 font-display" style={{ color: '#F59E0B' }}>
                  {totalXPFromAchievements.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: '#5C5A7A' }}>⚡ Total XP from Badges</div>
              </div>

              {/* Next to unlock */}
              {nextToUnlock.length > 0 && (
                <div
                  className="p-5 rounded-2xl border"
                  style={{ background: '#13131F', borderColor: '#1E1E35' }}
                >
                  <div className="text-sm font-bold mb-3 font-display" style={{ color: '#F1F0FF' }}>
                    Next to Unlock
                  </div>
                  <div className="space-y-3">
                    {nextToUnlock.map(def => {
                      const cfg = RARITY_CONFIG[def.rarity]
                      return (
                        <div key={def.key} className="flex items-center gap-2.5">
                          <span className="text-xl">{def.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: '#F1F0FF' }}>
                              {def.name}
                            </div>
                            <div className="text-xs" style={{ color: cfg.color }}>{cfg.label}</div>
                          </div>
                          <ChevronRight size={12} style={{ color: '#5C5A7A' }} />
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
