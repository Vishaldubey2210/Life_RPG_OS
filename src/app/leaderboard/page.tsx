'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Users, Globe, Swords, Clock } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

// ─── Season Config ─────────────────────────────────────────────────────────────

const CURRENT_SEASON = {
  name: 'The Beginning',
  number: 1,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  rewards: ['Legendary Crown Badge 👑', 'Season 1 Title ⚔️', '1000 Bonus XP ⚡'],
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_emoji: string
  level: number
  xp_earned: number
  quests_completed: number
  streak: number
  rank: number
}

interface Guild {
  id: string
  name: string
  emoji: string
  total_xp: number
  member_count: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

function weekProgress(): number {
  const weekStart = new Date(CURRENT_SEASON.startDate).getTime()
  const weekEnd = new Date(CURRENT_SEASON.endDate).getTime()
  const now = Date.now()
  return Math.min(100, ((now - weekStart) / (weekEnd - weekStart)) * 100)
}

function getRankStyle(rank: number): { bg: string; color: string; icon: string } {
  if (rank === 1) return { bg: '#F59E0B22', color: '#F59E0B', icon: '👑' }
  if (rank === 2) return { bg: '#9CA3AF22', color: '#9CA3AF', icon: '🥈' }
  if (rank === 3) return { bg: '#B45309AA', color: '#B45309', icon: '🥉' }
  if (rank <= 10) return { bg: '#7C3AED22', color: '#9F67FF', icon: `#${rank}` }
  return { bg: '#1E1E35', color: '#9B99B8', icon: `#${rank}` }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{ background: '#13131F', opacity: 1 - i * 0.08 }}
        >
          <div className="w-10 h-10 rounded-xl" style={{ background: '#1E1E35' }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded w-32" style={{ background: '#1E1E35' }} />
            <div className="h-3 rounded w-20" style={{ background: '#1E1E35' }} />
          </div>
          <div className="w-16 h-4 rounded" style={{ background: '#1E1E35' }} />
        </div>
      ))}
    </div>
  )
}

// ─── Podium (Top 3) ───────────────────────────────────────────────────────────

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length < 1) return null

  const positions = [
    entries[1] ?? null,  // #2 left
    entries[0] ?? null,  // #1 center
    entries[2] ?? null,  // #3 right
  ]

  const heights = ['80px', '110px', '60px']
  const crowns = ['🥈', '👑', '🥉']
  const glows = ['#9CA3AF', '#F59E0B', '#B45309']
  const rankNums = [2, 1, 3]

  return (
    <div className="flex items-end justify-center gap-4 mb-8 px-4">
      {positions.map((entry, i) => {
        if (!entry) return <div key={i} className="flex-1 max-w-[140px]" />
        const isFirst = i === 1
        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="flex-1 max-w-[160px] flex flex-col items-center"
          >
            {/* Crown & Avatar */}
            <div className="text-2xl mb-1">{crowns[i]}</div>
            <div
              className={`text-4xl mb-2 ${isFirst ? 'text-5xl' : ''}`}
              style={{ filter: isFirst ? `drop-shadow(0 0 12px ${glows[i]}88)` : undefined }}
            >
              {entry.avatar_emoji}
            </div>
            <div
              className="text-xs font-semibold truncate w-full text-center mb-2"
              style={{ color: '#F1F0FF', fontFamily: 'Oxanium, sans-serif' }}
            >
              {entry.display_name}
            </div>
            <div className="text-xs mb-2" style={{ color: glows[i] }}>
              ⚡ {entry.xp_earned} XP
            </div>

            {/* Podium platform */}
            <div
              className="w-full rounded-t-xl flex items-center justify-center font-bold text-2xl"
              style={{
                height: heights[i],
                background: `linear-gradient(180deg, ${glows[i]}33, ${glows[i]}11)`,
                border: `1px solid ${glows[i]}44`,
                borderBottom: 'none',
                fontFamily: 'Oxanium, sans-serif',
                color: glows[i],
                boxShadow: isFirst ? `0 0 30px ${glows[i]}33` : undefined,
              }}
            >
              #{rankNums[i]}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  isCurrentUser,
  maxXp,
}: {
  entry: LeaderboardEntry
  isCurrentUser: boolean
  maxXp: number
}) {
  const { bg, color, icon } = getRankStyle(entry.rank)
  const pct = maxXp > 0 ? (entry.xp_earned / maxXp) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(entry.rank * 0.04, 0.4) }}
      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
      style={{
        background: isCurrentUser ? '#7C3AED22' : '#13131F',
        border: `1px solid ${isCurrentUser ? '#7C3AED44' : '#1E1E35'}`,
        boxShadow: isCurrentUser ? '0 0 20px #7C3AED11' : 'none',
      }}
    >
      {/* Rank Badge */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: bg, color, fontFamily: 'Oxanium, sans-serif', fontSize: entry.rank > 9 ? 11 : 14 }}
      >
        {icon}
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-2xl flex-shrink-0">{entry.avatar_emoji}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate" style={{ color: '#F1F0FF' }}>
              {entry.display_name}
            </span>
            {isCurrentUser && (
              <span
                className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: '#7C3AED33', color: '#9F67FF', fontFamily: 'Oxanium, sans-serif' }}
              >
                You
              </span>
            )}
          </div>
          <div className="text-xs" style={{ color: '#9B99B8' }}>Level {entry.level}</div>
        </div>
      </div>

      {/* XP Bar + Number */}
      <div className="hidden md:flex flex-col gap-1 min-w-[120px]">
        <div className="flex justify-between text-xs mb-0.5">
          <span style={{ color: '#9B99B8' }}>XP</span>
          <span style={{ color: '#9F67FF', fontFamily: 'Oxanium, sans-serif' }}>{entry.xp_earned}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #9F67FF)', width: `${pct}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Quests */}
      <div className="hidden sm:block text-center min-w-[60px]">
        <div className="text-sm font-bold" style={{ color: '#22C55E', fontFamily: 'Oxanium, sans-serif' }}>
          {entry.quests_completed}
        </div>
        <div className="text-xs" style={{ color: '#5C5A7A' }}>quests</div>
      </div>

      {/* Streak */}
      <div className="text-center min-w-[50px] flex-shrink-0">
        <div className="text-sm font-bold" style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}>
          🔥{entry.streak}
        </div>
        <div className="text-xs" style={{ color: '#5C5A7A' }}>streak</div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const supabase = createClient()
  const { profile, loading: profileLoading } = useProfile()

  const [tab, setTab] = useState<'global' | 'friends' | 'guild'>('global')
  const [guildSubTab, setGuildSubTab] = useState<'guilds' | 'my_guild'>('guilds')
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([])
  const [friendEntries, setFriendEntries] = useState<LeaderboardEntry[]>([])
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [myGuildEntries, setMyGuildEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [daysLeft] = useState(daysUntil(CURRENT_SEASON.endDate))

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const updateSnapshot = useCallback(async () => {
    if (!profile?.id) return
    try {
      await supabase.rpc('upsert_weekly_snapshot', { p_user_id: profile.id })
    } catch { /* function may not exist yet, skip */ }
  }, [profile?.id, supabase])

  const fetchLeaderboard = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)

    try {
      await updateSnapshot()

      // ── Global Leaderboard ──────────────────────────────────────────────────
      // Since snapshot table may not have data yet, we build from profiles + completions
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_emoji, level, streak, xp')
        .order('xp', { ascending: false })
        .limit(50)

      if (profilesData && profilesData.length > 0) {
        const userIds = profilesData.map((p: { id: string }) => p.id)

        const { data: weeklyCompletions } = await supabase
          .from('habit_completions')
          .select('user_id, habits:habit_id(xp_reward)')
          .in('user_id', userIds)
          .gte('completed_at', `${weekStartStr}T00:00:00`)

        const xpMap: Record<string, number> = {}
        const countMap: Record<string, number> = {}

        ;(weeklyCompletions ?? []).forEach((c: {
          user_id: string
          habits: { xp_reward: number } | { xp_reward: number }[]
        }) => {
          const h = Array.isArray(c.habits) ? c.habits[0] : c.habits
          xpMap[c.user_id] = (xpMap[c.user_id] ?? 0) + (h?.xp_reward ?? 0)
          countMap[c.user_id] = (countMap[c.user_id] ?? 0) + 1
        })

        const ranked: LeaderboardEntry[] = profilesData
          .map((p: { id: string; display_name: string; avatar_emoji: string; level: number; streak: number }) => ({
            user_id: p.id,
            display_name: p.display_name,
            avatar_emoji: p.avatar_emoji,
            level: p.level,
            xp_earned: xpMap[p.id] ?? 0,
            quests_completed: countMap[p.id] ?? 0,
            streak: p.streak,
            rank: 0,
          }))
          .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.xp_earned - a.xp_earned)
          .map((e: LeaderboardEntry, i: number) => ({ ...e, rank: i + 1 }))

        setGlobalEntries(ranked)

        const me = ranked.find((e: LeaderboardEntry) => e.user_id === profile.id)
        if (me) setCurrentUserEntry(me)
      }

      // ── Friends Leaderboard ─────────────────────────────────────────────────
      const { data: myMemberships } = await supabase
        .from('party_members')
        .select('party_id')
        .eq('user_id', profile.id)

      if (myMemberships && myMemberships.length > 0) {
        const partyIds = myMemberships.map((m: { party_id: string }) => m.party_id)
        const { data: partyMembersData } = await supabase
          .from('party_members')
          .select('user_id')
          .in('party_id', partyIds)

        const friendIds = [...new Set((partyMembersData ?? []).map((m: { user_id: string }) => m.user_id))]

        if (friendIds.length > 0) {
          const { data: friendProfiles } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_emoji, level, streak')
            .in('id', friendIds)

          const { data: friendCompletions } = await supabase
            .from('habit_completions')
            .select('user_id, habits:habit_id(xp_reward)')
            .in('user_id', friendIds)
            .gte('completed_at', `${weekStartStr}T00:00:00`)

          const fxpMap: Record<string, number> = {}
          const fcountMap: Record<string, number> = {}
          ;(friendCompletions ?? []).forEach((c: {
            user_id: string
            habits: { xp_reward: number } | { xp_reward: number }[]
          }) => {
            const h = Array.isArray(c.habits) ? c.habits[0] : c.habits
            fxpMap[c.user_id] = (fxpMap[c.user_id] ?? 0) + (h?.xp_reward ?? 0)
            fcountMap[c.user_id] = (fcountMap[c.user_id] ?? 0) + 1
          })

          const friendRanked: LeaderboardEntry[] = (friendProfiles ?? [])
            .map((p: { id: string; display_name: string; avatar_emoji: string; level: number; streak: number }) => ({
              user_id: p.id,
              display_name: p.display_name,
              avatar_emoji: p.avatar_emoji,
              level: p.level,
              xp_earned: fxpMap[p.id] ?? 0,
              quests_completed: fcountMap[p.id] ?? 0,
              streak: p.streak,
              rank: 0,
            }))
            .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.xp_earned - a.xp_earned)
            .map((e: LeaderboardEntry, i: number) => ({ ...e, rank: i + 1 }))

          setFriendEntries(friendRanked)
        }
      }

      // ── Guild Leaderboard ───────────────────────────────────────────────────
      const { data: guildsData } = await supabase
        .from('guilds')
        .select('id, name, emoji, total_xp')
        .order('total_xp', { ascending: false })
        .limit(20)

      if (guildsData) {
        const enrichedGuilds: Guild[] = await Promise.all(
          guildsData.map(async (g: { id: string; name: string; emoji: string; total_xp: number }) => {
            const { count } = await supabase
              .from('guild_members')
              .select('*', { count: 'exact' })
              .eq('guild_id', g.id)
            return { ...g, member_count: count ?? 0 }
          })
        )
        setGuilds(enrichedGuilds)
      }

      // ── My Guild Members ────────────────────────────────────────────────────
      const { data: myGuildMembership } = await supabase
        .from('guild_members')
        .select('guild_id')
        .eq('user_id', profile.id)
        .limit(1)
        .maybeSingle()

      if (myGuildMembership) {
        const { data: guildMembers } = await supabase
          .from('guild_members')
          .select(`
            user_id, xp_contributed,
            profiles:user_id (display_name, avatar_emoji, level, streak)
          `)
          .eq('guild_id', myGuildMembership.guild_id)
          .order('xp_contributed', { ascending: false })

        const guildRanked: LeaderboardEntry[] = (guildMembers ?? [])
          .map((m: {
            user_id: string
            xp_contributed: number
            profiles: {
              display_name: string
              avatar_emoji: string
              level: number
              streak: number
            } | {
              display_name: string
              avatar_emoji: string
              level: number
              streak: number
            }[]
          }, i: number) => {
            const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
            return {
              user_id: m.user_id,
              display_name: p?.display_name ?? 'Unknown',
              avatar_emoji: p?.avatar_emoji ?? '⚔️',
              level: p?.level ?? 1,
              xp_earned: m.xp_contributed,
              quests_completed: 0,
              streak: p?.streak ?? 0,
              rank: i + 1,
            }
          })

        setMyGuildEntries(guildRanked)
      }
    } finally {
      setLoading(false)
    }
  }, [profile?.id, weekStartStr, supabase, updateSnapshot])

  useEffect(() => {
    if (profile?.id) fetchLeaderboard()
  }, [profile?.id, fetchLeaderboard])

  const maxXp = globalEntries.length > 0 ? globalEntries[0].xp_earned : 1
  const top3 = globalEntries.slice(0, 3)
  const rest = globalEntries.slice(3)
  const userInTop50 = globalEntries.some(e => e.user_id === profile?.id)

  const pageLoading = profileLoading || loading

  return (
    <div className="flex min-h-screen" style={{ background: '#08080F' }}>
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? '⚔️'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />
      <TopNav
        userAvatar={profile?.avatar_emoji ?? '⚔️'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main
        className="flex-1 overflow-y-auto p-6 xl:p-8"
        style={{ marginLeft: 240, paddingTop: 88 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
              Leaderboard 🏆
            </h1>
            <p style={{ color: '#9B99B8' }}>See how you rank against other adventurers this week</p>
          </div>

          {/* Season Banner */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A0A0A, #1A1025, #0A1A1A)',
              border: '1px solid #F59E0B33',
            }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 blur-3xl pointer-events-none"
              style={{ background: '#F59E0B' }}
            />
            <div className="relative flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Swords size={16} style={{ color: '#F59E0B' }} />
                  <span
                    className="text-xs font-bold"
                    style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}
                  >
                    SEASON {CURRENT_SEASON.number}: {CURRENT_SEASON.name.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm mb-2" style={{ color: '#9B99B8' }}>
                  Top 3 players this season win exclusive rewards
                </div>
                <div className="flex flex-wrap gap-2">
                  {CURRENT_SEASON.rewards.map(r => (
                    <span
                      key={r}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: '#F59E0B22', color: '#F59E0B' }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#9B99B8' }}>
                  <Clock size={14} />
                  <span>Season ends in</span>
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}
                >
                  {daysLeft}
                </div>
                <div className="text-xs" style={{ color: '#5C5A7A' }}>days remaining</div>

                {/* Season progress */}
                <div className="w-32 h-1.5 rounded-full overflow-hidden mt-1" style={{ background: '#1E1E35' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                      width: `${weekProgress()}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { key: 'global', icon: Globe, label: 'Global 🌍' },
              { key: 'friends', icon: Users, label: 'Friends 👥' },
              { key: 'guild', icon: Trophy, label: 'Guild 🏰' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key as 'global' | 'friends' | 'guild')}
                className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: tab === key ? '#7C3AED' : '#13131F',
                  color: tab === key ? '#fff' : '#9B99B8',
                  border: `1px solid ${tab === key ? '#7C3AED' : '#1E1E35'}`,
                  fontFamily: 'Oxanium, sans-serif',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {tab === 'global' && (
              <motion.div
                key="global"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                {pageLoading ? (
                  <LeaderboardSkeleton />
                ) : (
                  <>
                    {/* Podium */}
                    {top3.length >= 2 && <Podium entries={top3} />}

                    {/* Rest of list */}
                    <div className="space-y-2">
                      {rest.map(entry => (
                        <LeaderboardRow
                          key={entry.user_id}
                          entry={entry}
                          isCurrentUser={entry.user_id === profile?.id}
                          maxXp={maxXp}
                        />
                      ))}
                    </div>

                    {/* Sticky current user (if not in top 50) */}
                    {!userInTop50 && currentUserEntry && (
                      <div
                        className="mt-4 rounded-xl overflow-hidden"
                        style={{ border: '2px solid #7C3AED44' }}
                      >
                        <div
                          className="text-xs px-4 py-1.5 font-semibold"
                          style={{
                            background: '#7C3AED22',
                            color: '#9F67FF',
                            fontFamily: 'Oxanium, sans-serif',
                          }}
                        >
                          Your Position
                        </div>
                        <LeaderboardRow
                          entry={currentUserEntry}
                          isCurrentUser={true}
                          maxXp={maxXp}
                        />
                      </div>
                    )}

                    {globalEntries.length === 0 && (
                      <div className="text-center py-16">
                        <div className="text-5xl mb-4">🏆</div>
                        <h3 className="font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
                          No rankings yet
                        </h3>
                        <p className="text-sm" style={{ color: '#9B99B8' }}>
                          Complete some quests to appear on the leaderboard!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {tab === 'friends' && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                {pageLoading ? (
                  <LeaderboardSkeleton />
                ) : friendEntries.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">👥</div>
                    <h3 className="font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
                      No friends to compete with yet
                    </h3>
                    <p className="text-sm mb-6" style={{ color: '#9B99B8' }}>
                      Join or create a party to compete with friends
                    </p>
                    <Link
                      href="/party"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                      style={{
                        background: '#7C3AED',
                        color: '#fff',
                        fontFamily: 'Oxanium, sans-serif',
                        boxShadow: '0 0 20px #7C3AED44',
                      }}
                    >
                      <Users size={16} />
                      Go to Party 👥
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friendEntries.map(entry => (
                      <LeaderboardRow
                        key={entry.user_id}
                        entry={entry}
                        isCurrentUser={entry.user_id === profile?.id}
                        maxXp={friendEntries[0]?.xp_earned ?? 1}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'guild' && (
              <motion.div
                key="guild"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                {/* Guild Sub-tabs */}
                <div className="flex gap-2 mb-4">
                  {[
                    { key: 'guilds', label: 'Top Guilds' },
                    { key: 'my_guild', label: 'My Guild' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setGuildSubTab(key as 'guilds' | 'my_guild')}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: guildSubTab === key ? '#1E1E35' : 'transparent',
                        color: guildSubTab === key ? '#F1F0FF' : '#9B99B8',
                        border: `1px solid ${guildSubTab === key ? '#2E2E50' : 'transparent'}`,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {pageLoading ? (
                  <LeaderboardSkeleton />
                ) : guildSubTab === 'guilds' ? (
                  <div className="space-y-2">
                    {guilds.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">🏰</div>
                        <p className="text-sm" style={{ color: '#9B99B8' }}>No guilds yet. Create one in the party page!</p>
                      </div>
                    ) : (
                      guilds.map((guild, i) => (
                        <motion.div
                          key={guild.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-xl"
                          style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                            style={{
                              background: i === 0 ? '#F59E0B22' : i === 1 ? '#9CA3AF22' : '#1E1E35',
                              color: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : '#9B99B8',
                              fontFamily: 'Oxanium, sans-serif',
                            }}
                          >
                            #{i + 1}
                          </div>
                          <div className="text-2xl">{guild.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate" style={{ color: '#F1F0FF' }}>
                              {guild.name}
                            </div>
                            <div className="text-xs" style={{ color: '#9B99B8' }}>
                              {guild.member_count} members
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="font-bold text-sm"
                              style={{ color: '#9F67FF', fontFamily: 'Oxanium, sans-serif' }}
                            >
                              ⚡ {guild.total_xp}
                            </div>
                            <div className="text-xs" style={{ color: '#5C5A7A' }}>Total XP</div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myGuildEntries.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">🏰</div>
                        <p className="text-sm mb-4" style={{ color: '#9B99B8' }}>
                          You&apos;re not in a guild yet.
                        </p>
                        <Flame size={16} style={{ color: '#EF4444', display: 'inline' }} />
                        <span className="text-sm ml-1" style={{ color: '#5C5A7A' }}>
                          Guild system coming soon — ask the party leader to create one!
                        </span>
                      </div>
                    ) : (
                      myGuildEntries.map(entry => (
                        <LeaderboardRow
                          key={entry.user_id}
                          entry={entry}
                          isCurrentUser={entry.user_id === profile?.id}
                          maxXp={myGuildEntries[0]?.xp_earned ?? 1}
                        />
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
