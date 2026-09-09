'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Users, Globe, Swords, Clock, Crown, Medal, Zap, Sparkles, Shield } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

// ─── Season Config ─────────────────────────────────────────────────────────────

const CURRENT_SEASON = {
  name: 'The Beginning',
  number: 1,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  rewards: ['Legendary Crown Badge', 'Season 1 Title', '1000 Bonus XP'],
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

function getRankStyle(rank: number): { bg: string; color: string; content: React.ReactNode } {
  if (rank === 1) return { bg: '#FEF3C7', color: '#D97706', content: <Crown size={18} /> }
  if (rank === 2) return { bg: '#F3F4F6', color: '#4B5563', content: <Medal size={18} /> }
  if (rank === 3) return { bg: '#FFEDD5', color: '#C2410C', content: <Medal size={18} /> }
  if (rank <= 10) return { bg: '#EDECFD', color: '#5B57F0', content: `#${rank}` }
  return { bg: '#FAF8F5', color: '#8A857A', content: `#${rank}` }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#EAE6DD]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded w-32 bg-[#FAF8F5]" />
            <div className="h-3 rounded w-20 bg-[#FAF8F5]" />
          </div>
          <div className="w-16 h-4 rounded bg-[#FAF8F5]" />
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
  const icons = [
    <Medal key="silver" size={24} className="text-slate-400" />,
    <Crown key="gold" size={28} className="text-amber-500" />,
    <Medal key="bronze" size={22} className="text-amber-700" />,
  ]
  const colors = ['#64748B', '#D97706', '#C2410C']
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
            <div className="mb-2 flex items-center justify-center">{icons[i]}</div>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 bg-white border border-[#EAE6DD] shadow-sm ${isFirst ? 'w-14 h-14 ring-2 ring-amber-400/30 shadow-md' : ''}`}
              style={{
                color: colors[i],
              }}
            >
              <DynamicIcon name={entry.avatar_emoji} size={isFirst ? 30 : 24} />
            </div>
            <div
              className="text-xs font-bold truncate w-full text-center mb-1 text-[#232019]"
            >
              {entry.display_name}
            </div>
            <div className="text-xs mb-2 flex items-center gap-1 font-bold" style={{ color: colors[i] }}>
              <Zap size={11} /> {entry.xp_earned} XP
            </div>

            {/* Podium platform */}
            <div
              className="w-full rounded-t-2xl flex items-center justify-center font-extrabold text-2xl bg-white border border-[#EAE6DD] shadow-xs"
              style={{
                height: heights[i],
                color: colors[i],
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
  const { bg, color, content } = getRankStyle(entry.rank)
  const pct = maxXp > 0 ? (entry.xp_earned / maxXp) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(entry.rank * 0.04, 0.4) }}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 shadow-xs border ${
        isCurrentUser
          ? 'bg-purple-50/70 border-[#5B57F0]/40 ring-2 ring-[#5B57F0]/10'
          : 'bg-white border-[#EAE6DD] hover:bg-[#FAF8F5]'
      }`}
    >
      {/* Rank Badge */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow-2xs border border-[#EAE6DD]/50"
        style={{ background: bg, color, fontSize: entry.rank > 9 ? 12 : 14 }}
      >
        {content}
      </div>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 border border-purple-200 text-[#5B57F0] shadow-2xs"
        >
          <DynamicIcon name={entry.avatar_emoji} size={20} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#232019] truncate">
              {entry.display_name}
            </span>
            {isCurrentUser && (
              <span
                className="text-2xs px-1.5 py-0.5 rounded-md font-bold bg-[#EDECFD] text-[#5B57F0] flex-shrink-0"
              >
                You
              </span>
            )}
          </div>
          <div className="text-xs text-[#6E6A61]">Level {entry.level}</div>
        </div>
      </div>

      {/* XP Bar + Number */}
      <div className="hidden md:flex flex-col gap-1 min-w-[120px]">
        <div className="flex justify-between text-xs mb-0.5 font-semibold">
          <span className="text-[#8A857A]">XP</span>
          <span className="text-[#5B57F0]">{entry.xp_earned}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#EAE6DD]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#5B57F0] to-[#8B5CF6]"
            style={{ width: `${pct}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Quests */}
      <div className="hidden sm:block text-center min-w-[60px]">
        <div className="text-sm font-bold text-emerald-600">
          {entry.quests_completed}
        </div>
        <div className="text-2xs text-[#8A857A]">quests</div>
      </div>

      {/* Streak */}
      <div className="text-center min-w-[50px] flex-shrink-0">
        <div className="text-sm font-bold flex items-center justify-center gap-1 text-amber-600">
          <Flame size={13} className="text-amber-500" />
          <span>{entry.streak}</span>
        </div>
        <div className="text-2xs text-[#8A857A]">streak</div>
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
              avatar_emoji: p?.avatar_emoji ?? 'swords',
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
    <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]">
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? 'leaf'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />
      <TopNav
        userAvatar={profile?.avatar_emoji ?? 'leaf'}
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
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3 text-[#232019]">
              <span>Leaderboard</span>
              <Trophy className="w-8 h-8 text-amber-500 inline" />
            </h1>
            <p className="text-sm text-[#6E6A61]">See how you rank against other adventurers this week</p>
          </div>

          {/* Season Banner */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl mb-6 relative overflow-hidden bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-purple-50/50 border border-amber-200 shadow-sm"
          >
            <div className="relative flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Swords size={16} className="text-amber-600" />
                  <span
                    className="text-xs font-bold text-amber-700 uppercase tracking-wider"
                  >
                    SEASON {CURRENT_SEASON.number}: {CURRENT_SEASON.name.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm mb-2 text-[#6E6A61]">
                  Top 3 players this season win exclusive rewards
                </div>
                <div className="flex flex-wrap gap-2">
                  {CURRENT_SEASON.rewards.map(r => (
                    <span
                      key={r}
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[#6E6A61]">
                  <Clock size={14} />
                  <span>Season ends in</span>
                </div>
                <div
                  className="text-3xl font-extrabold text-amber-600"
                >
                  {daysLeft}
                </div>
                <div className="text-2xs text-[#8A857A]">days remaining</div>

                {/* Season progress */}
                <div className="w-32 h-1.5 rounded-full overflow-hidden mt-1 bg-white border border-amber-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                    style={{
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
              { key: 'global', icon: Globe, label: 'Global' },
              { key: 'friends', icon: Users, label: 'Friends' },
              { key: 'guild', icon: Shield, label: 'Guild' },
            ].map(({ key, icon: TabIcon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key as 'global' | 'friends' | 'guild')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs border ${
                  tab === key
                    ? 'bg-[#5B57F0] text-white border-[#5B57F0]'
                    : 'bg-white text-[#6E6A61] border-[#EAE6DD] hover:bg-[#FAF8F5]'
                }`}
              >
                <TabIcon size={16} />
                <span>{label}</span>
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
                        className="mt-4 rounded-2xl overflow-hidden border-2 border-[#5B57F0]/40 shadow-sm"
                      >
                        <div
                          className="text-xs px-4 py-1.5 font-bold bg-[#EDECFD] text-[#5B57F0]"
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
                        <div className="flex justify-center mb-4">
                          <Trophy className="w-12 h-12 text-[#8A857A]" />
                        </div>
                        <h3 className="font-bold mb-1 text-[#232019]">
                          No rankings yet
                        </h3>
                        <p className="text-sm text-[#6E6A61]">
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
                    <div className="flex justify-center mb-4">
                      <Users className="w-12 h-12 text-[#8A857A]" />
                    </div>
                    <h3 className="font-bold mb-2 text-[#232019]">
                      No friends to compete with yet
                    </h3>
                    <p className="text-sm mb-6 text-[#6E6A61]">
                      Join or create a party to compete with friends
                    </p>
                    <Link
                      href="/party"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all bg-[#5B57F0] text-white hover:bg-[#4F46E5] shadow-xs cursor-pointer"
                    >
                      <Users size={16} />
                      <span>Go to Party</span>
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
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                        guildSubTab === key
                          ? 'bg-purple-50 text-[#5B57F0] border border-purple-200'
                          : 'text-[#6E6A61] hover:bg-[#FAF8F5]'
                      }`}
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
                        <div className="flex justify-center mb-4">
                          <Shield className="w-12 h-12 text-[#8A857A]" />
                        </div>
                        <p className="text-sm text-[#6E6A61]">No guilds yet. Create one in the party page!</p>
                      </div>
                    ) : (
                      guilds.map((guild, i) => (
                        <motion.div
                          key={guild.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                            style={{
                              background: i === 0 ? '#FEF3C7' : i === 1 ? '#F3F4F6' : '#FAF8F5',
                              color: i === 0 ? '#D97706' : i === 1 ? '#4B5563' : '#8A857A',
                            }}
                          >
                            #{i + 1}
                          </div>
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 border border-purple-200 text-[#5B57F0]"
                          >
                            <DynamicIcon name={guild.emoji || 'shield'} size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[#232019] truncate">
                              {guild.name}
                            </div>
                            <div className="text-xs text-[#6E6A61]">
                              {guild.member_count} members
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="font-bold text-sm flex items-center justify-end gap-1 text-[#5B57F0]"
                            >
                              <Zap size={12} /> {guild.total_xp}
                            </div>
                            <div className="text-2xs text-[#8A857A]">Total XP</div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myGuildEntries.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="flex justify-center mb-4">
                          <Shield className="w-12 h-12 text-[#8A857A]" />
                        </div>
                        <p className="text-sm mb-4 text-[#6E6A61]">
                          You&apos;re not in a guild yet.
                        </p>
                        <Flame size={16} className="text-rose-500 inline" />
                        <span className="text-sm ml-1 text-[#8A857A]">
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
