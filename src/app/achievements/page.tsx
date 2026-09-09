'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  CheckCircle2,
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
  common:    { label: 'Common',    color: '#6E6A61', bg: '#F3F0E6', border: '#EAE6DD', glow: 'none', Icon: Shield },
  rare:      { label: 'Rare',      color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', glow: '0 4px 12px rgba(37,99,235,0.08)', Icon: Zap },
  epic:      { label: 'Epic',      color: '#5B57F0', bg: '#EDECFD', border: '#D6D3FA', glow: '0 4px 14px rgba(91,87,240,0.12)', Icon: Sparkles },
  legendary: { label: 'Legendary', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', glow: '0 4px 16px rgba(217,119,6,0.15)', Icon: Crown },
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
      <div className="flex items-center justify-center min-h-screen bg-[#FBFAF7]">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="w-12 h-12 text-amber-500 animate-bounce" />
          </div>
          <div className="text-sm text-[#8A857A]">
            Loading Achievement Hall...
          </div>
        </div>
      </div>
    )
  }

  if (defs.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]">
        <Sidebar
          userAvatar={profile?.avatar_emoji ?? 'leaf'}
          userName={profile?.display_name ?? 'Adventurer'}
          userLevel={profile?.level ?? 1}
        />
        <main className="flex-1 flex items-center justify-center" style={{ marginLeft: 240 }}>
          <div className="text-center bg-white p-8 rounded-2xl border border-[#EAE6DD] shadow-sm max-w-md">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-[#8A857A]" />
            </div>
            <h2 className="text-xl font-bold mb-2 font-display text-[#232019]">
              No achievements yet
            </h2>
            <p className="text-sm mb-4 text-[#6E6A61]">
              Run <code className="text-[#5B57F0] bg-[#EDECFD] px-1.5 py-0.5 rounded">supabase-day4.sql</code> in your Supabase SQL Editor to enable the achievement system.
            </p>
            <Link href="/dashboard" className="text-sm px-4 py-2 rounded-xl bg-[#5B57F0] text-white font-medium shadow-sm hover:bg-[#4D49E0] transition-colors inline-block">
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]">
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? 'leaf'}
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
            <h1 className="text-3xl font-bold mb-1 font-display flex items-center gap-3 text-[#232019]">
              <span>Achievement Hall</span>
              <Trophy className="w-7 h-7 text-amber-500 inline" />
            </h1>
            <p className="text-[#6E6A61] text-sm font-medium">
              {earnedKeys.size} of {defs.length} achievements unlocked
            </p>

            <div className="mt-4 h-2.5 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#EAE6DD] max-w-xl">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #5B57F0, #10B981, #F59E0B)' }}
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#EDECFD] border-[#5B57F0] text-[#5B57F0] shadow-sm'
                      : 'bg-white border-[#EAE6DD] text-[#6E6A61] hover:text-[#232019] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isSelected ? 'bg-[#5B57F0] text-white' : 'bg-[#FAF8F5] text-[#8A857A] border border-[#EAE6DD]'
                    }`}
                    style={{ fontSize: 10 }}
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

                    return (
                      <motion.div
                        key={def.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`relative p-5 rounded-2xl border transition-all duration-200 ${
                          isUnlocked
                            ? 'bg-white shadow-sm'
                            : 'bg-[#FAF8F5]/80 opacity-75'
                        }`}
                        style={{
                          borderColor: isUnlocked ? cfg.border : '#EAE6DD',
                          boxShadow: isUnlocked ? cfg.glow : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border"
                            style={{
                              background: cfg.bg,
                              color: cfg.color,
                              borderColor: cfg.border,
                            }}
                          >
                            <cfg.Icon size={11} /> {cfg.label}
                          </span>
                          {isUnlocked ? (
                            <CheckCircle2 size={16} className="text-[#10B981]" />
                          ) : (
                            <Lock size={14} className="text-[#8A857A]" />
                          )}
                        </div>

                        <div className="relative inline-block mb-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl"
                            style={{
                              filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.4)',
                              color: cfg.color,
                            }}
                          >
                            <DynamicIcon name={def.emoji} size={32} />
                          </div>
                        </div>

                        <div className="font-bold text-sm mb-1 font-display text-[#232019]">
                          {def.name}
                        </div>
                        <div className="text-xs mb-3 text-[#6E6A61] leading-relaxed">
                          {def.is_hidden && !isUnlocked ? 'Hidden achievement. Complete mysterious conditions to unlock.' : def.description}
                        </div>

                        <div className="flex items-end justify-between gap-2 pt-2 border-t border-[#EAE6DD]">
                          <div className="text-[11px] text-[#8A857A]">
                            {isUnlocked && earnedDate ? `Earned ${new Date(earnedDate).toLocaleDateString()}` : 'Locked'}
                          </div>
                          <span
                            className="text-xs font-bold flex-shrink-0 flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
                          >
                            <Zap size={11} />+{def.xp_reward} XP
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="hidden xl:flex flex-col gap-4" style={{ width: 260 }}>
              <div className="p-5 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm">
                <div className="text-sm font-bold mb-4 font-display text-[#232019]">Rarity Breakdown</div>
                <div className="space-y-3">
                  {rarityStats.map(r => {
                    const cfg = RARITY_CONFIG[r.rarity]
                    const IconComp = cfg.Icon
                    return (
                      <div key={r.rarity}>
                        <div className="flex justify-between text-xs mb-1 font-medium">
                          <span className="flex items-center gap-1.5" style={{ color: cfg.color }}>
                            <IconComp size={12} />
                            <span>{cfg.label}</span>
                          </span>
                          <span className="text-[#8A857A]">{r.earned}/{r.total}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#EAE6DD]">
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

              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 text-center shadow-sm">
                <div className="text-3xl font-bold mb-1 font-display text-amber-600">
                  {totalXPFromAchievements.toLocaleString()}
                </div>
                <div className="text-xs flex items-center justify-center gap-1 text-[#6E6A61] font-medium">
                  <Zap size={12} className="text-amber-500" /> Total XP from Badges
                </div>
              </div>

              {nextToUnlock.length > 0 && (
                <div className="p-5 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm">
                  <div className="text-sm font-bold mb-3 font-display text-[#232019]">Next to Unlock</div>
                  <div className="space-y-3">
                    {nextToUnlock.map(def => {
                      const cfg = RARITY_CONFIG[def.rarity]
                      return (
                        <div key={def.key} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD]">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center border"
                            style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                          >
                            <DynamicIcon name={def.emoji} size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold truncate text-[#232019]">{def.name}</div>
                            <div className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.label} • +{def.xp_reward} XP</div>
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

