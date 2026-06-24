'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Heart, Zap, Crown, Link as LinkIcon, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoupleLink {
  id: string
  user_1: string
  user_2: string | null
  invite_code: string
  status: 'pending' | 'active'
  shared_xp: number
  created_at: string
}

interface PartnerProfile {
  id: string
  display_name: string
  avatar_emoji: string
  level: number
  xp: number
  streak: number
  hp: number
  hp_max: number
}

interface PartnerStats {
  str: number
  int: number
  wis: number
  vit: number
  gold: number
  cha: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

const STAT_CONFIG = [
  { key: 'str', label: 'STR', icon: '💪', color: '#EF4444' },
  { key: 'int', label: 'INT', icon: '🧠', color: '#3B82F6' },
  { key: 'wis', label: 'WIS', icon: '🧘', color: '#22C55E' },
  { key: 'vit', label: 'VIT', icon: '❤️', color: '#EF4444' },
  { key: 'gold', label: 'GOLD', icon: '💰', color: '#F59E0B' },
  { key: 'cha', label: 'CHA', icon: '🗣️', color: '#9F67FF' },
]

function StatBar({ value, color, label, icon }: { value: number; color: string; label: string; icon: string }) {
  const pct = Math.min(100, (value / 50) * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-4">{icon}</span>
      <span className="text-xs font-semibold w-8" style={{ color: '#9B99B8', fontFamily: 'Oxanium, sans-serif' }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, width: `${pct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />
      </div>
      <span className="text-xs w-4 text-right" style={{ color: '#F1F0FF' }}>{value}</span>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 rounded w-48" style={{ background: '#13131F' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl" style={{ background: '#13131F' }} />
        <div className="h-64 rounded-2xl" style={{ background: '#13131F' }} />
      </div>
    </div>
  )
}

// ─── Profile Panel ─────────────────────────────────────────────────────────────

function ProfilePanel({
  profile,
  stats,
  questsDone,
  questsTotal,
  weeklyXp,
  isMe,
}: {
  profile: PartnerProfile
  stats: PartnerStats
  questsDone: number
  questsTotal: number
  weeklyXp: number
  isMe: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isMe ? -24 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 rounded-2xl relative overflow-hidden"
      style={{
        background: '#13131F',
        border: `1px solid ${isMe ? '#7C3AED44' : '#EC489944'}`,
        boxShadow: `0 0 30px ${isMe ? '#7C3AED11' : '#EC489911'}`,
      }}
    >
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: isMe ? '#7C3AED' : '#EC4899' }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="text-5xl">{profile.avatar_emoji}</div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: isMe ? '#7C3AED' : '#EC4899',
                color: '#fff',
                fontFamily: 'Oxanium, sans-serif',
              }}
            >
              {profile.level}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg font-display" style={{ color: '#F1F0FF' }}>
                {profile.display_name}
              </h3>
              {isMe && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: '#7C3AED33',
                    color: '#9F67FF',
                    fontFamily: 'Oxanium, sans-serif',
                  }}
                >
                  You
                </span>
              )}
            </div>
            <div className="text-sm" style={{ color: '#9B99B8' }}>Level {profile.level}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2.5 mb-5">
          {STAT_CONFIG.map(({ key, label, icon, color }) => (
            <StatBar
              key={key}
              value={stats[key as keyof PartnerStats] ?? 1}
              color={color}
              label={label}
              icon={icon}
            />
          ))}
        </div>

        {/* Quest Progress Today */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9B99B8' }}>
            <span>Today&apos;s Quests</span>
            <span style={{ color: questsDone >= questsTotal && questsTotal > 0 ? '#22C55E' : '#F1F0FF' }}>
              {questsDone}/{questsTotal}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isMe
                  ? 'linear-gradient(90deg, #7C3AED, #9F67FF)'
                  : 'linear-gradient(90deg, #EC4899, #F9A8D4)',
                width: `${questsTotal > 0 ? (questsDone / questsTotal) * 100 : 0}%`,
              }}
              animate={{ width: `${questsTotal > 0 ? (questsDone / questsTotal) * 100 : 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-xl" style={{ background: '#0F0F1A' }}>
            <div className="text-lg">🔥</div>
            <div className="text-sm font-bold" style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}>
              {profile.streak}
            </div>
            <div className="text-xs" style={{ color: '#5C5A7A' }}>Streak</div>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: '#0F0F1A' }}>
            <div className="text-lg">⚡</div>
            <div className="text-sm font-bold" style={{ color: '#9F67FF', fontFamily: 'Oxanium, sans-serif' }}>
              {weeklyXp}
            </div>
            <div className="text-xs" style={{ color: '#5C5A7A' }}>XP/week</div>
          </div>
          <div className="text-center p-2 rounded-xl" style={{ background: '#0F0F1A' }}>
            <div className="text-lg">🏆</div>
            <div className="text-sm font-bold" style={{ color: '#22C55E', fontFamily: 'Oxanium, sans-serif' }}>
              {profile.level * 100 + profile.xp}
            </div>
            <div className="text-xs" style={{ color: '#5C5A7A' }}>Total XP</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CouplePage() {
  const supabase = createClient()
  const { profile, stats, habits, completions_today, loading: profileLoading } = useProfile()

  const [coupleLink, setCoupleLink] = useState<CoupleLink | null>(null)
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [partnerStats, setPartnerStats] = useState<PartnerStats | null>(null)
  const [partnerQuestsDone, setPartnerQuestsDone] = useState(0)
  const [partnerQuestsTotal, setPartnerQuestsTotal] = useState(0)
  const [partnerWeeklyXp, setPartnerWeeklyXp] = useState(0)
  const [myWeeklyXp, setMyWeeklyXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [codeCopied, setCodeCopied] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  const fetchCoupleData = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)

    try {
      const { data: link } = await supabase
        .from('couple_links')
        .select('*')
        .or(`user_1.eq.${profile.id},user_2.eq.${profile.id}`)
        .maybeSingle()

      setCoupleLink(link)

      if (!link || link.status !== 'active') {
        setLoading(false)
        return
      }

      const partnerId = link.user_1 === profile.id ? link.user_2 : link.user_1
      if (!partnerId) { setLoading(false); return }

      const today = new Date().toISOString().split('T')[0]
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const [
        { data: partnerProfileData },
        { data: partnerStatsData },
        { data: partnerCompData },
        { data: partnerHabitsData },
        { data: myWeeklyData },
        { data: partnerWeeklyData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', partnerId).single(),
        supabase.from('stats').select('*').eq('user_id', partnerId).single(),
        supabase.from('habit_completions').select('id').eq('user_id', partnerId).gte('completed_at', `${today}T00:00:00`),
        supabase.from('habits').select('id').eq('user_id', partnerId).eq('is_active', true),
        supabase.from('habit_completions').select('habits:habit_id(xp_reward)').eq('user_id', profile.id).gte('completed_at', `${weekStartStr}T00:00:00`),
        supabase.from('habit_completions').select('habits:habit_id(xp_reward)').eq('user_id', partnerId).gte('completed_at', `${weekStartStr}T00:00:00`),
      ])

      if (partnerProfileData) setPartner(partnerProfileData)
      if (partnerStatsData) setPartnerStats(partnerStatsData)
      setPartnerQuestsDone((partnerCompData ?? []).length)
      setPartnerQuestsTotal((partnerHabitsData ?? []).length)

      const calcXp = (data: { habits: { xp_reward: number } | { xp_reward: number }[] }[] | null) =>
        (data ?? []).reduce((sum: number, c) => {
          const h = Array.isArray(c.habits) ? c.habits[0] : c.habits
          return sum + (h?.xp_reward ?? 0)
        }, 0)

      setMyWeeklyXp(calcXp(myWeeklyData as { habits: { xp_reward: number } | { xp_reward: number }[] }[] | null))
      setPartnerWeeklyXp(calcXp(partnerWeeklyData as { habits: { xp_reward: number } | { xp_reward: number }[] }[] | null))
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase])

  useEffect(() => {
    if (profile?.id) fetchCoupleData()
  }, [profile?.id, fetchCoupleData])

  async function generateInvite() {
    if (!profile?.id) return
    try {
      const { data, error } = await supabase
        .from('couple_links')
        .insert({ user_1: profile.id })
        .select()
        .single()

      if (error) throw error
      setCoupleLink(data)
      toast.success('💑 Invite link generated!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate invite')
    }
  }

  async function joinWithCode() {
    if (!joinCode.trim() || !profile?.id) return
    try {
      const { data: link, error: findErr } = await supabase
        .from('couple_links')
        .select('*')
        .eq('invite_code', joinCode.toUpperCase())
        .eq('status', 'pending')
        .single()

      if (findErr || !link) throw new Error('Invite not found or already used')
      if (link.user_1 === profile.id) throw new Error('You cannot link with yourself!')

      const { error: updateErr } = await supabase
        .from('couple_links')
        .update({ user_2: profile.id, status: 'active' })
        .eq('id', link.id)

      if (updateErr) throw updateErr

      toast.success('💑 Linked! Welcome to Couple Mode!')
      fetchCoupleData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to link')
    }
  }

  async function shareReport() {
    if (!reportRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#13131F',
        scale: 2,
      })
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'couple-report.png'
        a.click()
        URL.revokeObjectURL(url)
      })
      toast.success('Report saved! 📸')
    } catch {
      toast.error('Failed to save report')
    }
  }

  function copyInviteLink() {
    if (!coupleLink) return
    const url = `${window.location.origin}/couple/join/${coupleLink.invite_code}`
    navigator.clipboard.writeText(url)
    setCodeCopied(true)
    toast.success('Invite link copied! 💑')
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const pageLoading = profileLoading || loading

  if (pageLoading) {
    return (
      <div className="flex min-h-screen" style={{ background: '#08080F' }}>
        <Sidebar userAvatar={profile?.avatar_emoji ?? '⚔️'} userName={profile?.display_name ?? 'Adventurer'} userLevel={profile?.level ?? 1} />
        <main className="flex-1 p-6 pt-20" style={{ marginLeft: 240 }}>
          <SkeletonLoader />
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
      <TopNav
        userAvatar={profile?.avatar_emoji ?? '⚔️'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240, paddingTop: 88 }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/party"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: '#9B99B8' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F1F0FF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9B99B8')}
            >
              <ArrowLeft size={16} />
              Back to Party
            </Link>
            <div className="w-px h-4" style={{ background: '#2E2E50' }} />
            <h1 className="text-3xl font-bold font-display" style={{ color: '#F1F0FF' }}>
              Couple Mode 💑
            </h1>
          </div>

          {/* No couple link yet */}
          {!coupleLink && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-8xl mb-6"
              >
                💑
              </motion.div>
              <h2 className="text-2xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
                Couple Mode
              </h2>
              <p className="text-center mb-8 max-w-md" style={{ color: '#9B99B8' }}>
                Link with your partner to share your journey, track habits together, and earn shared XP!
              </p>

              <div className="flex flex-col gap-4 w-full max-w-sm">
                <button
                  onClick={generateInvite}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    color: '#fff',
                    fontFamily: 'Oxanium, sans-serif',
                    boxShadow: '0 0 20px #EC489944',
                  }}
                >
                  💑 Generate Invite Link
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: '#1E1E35' }} />
                  <span className="text-xs" style={{ color: '#5C5A7A' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: '#1E1E35' }} />
                </div>

                <div className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Partner's code..."
                    maxLength={8}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none text-center tracking-widest font-bold uppercase"
                    style={{
                      background: '#13131F',
                      border: '1px solid #2E2E50',
                      color: '#F1F0FF',
                      fontFamily: 'Oxanium, sans-serif',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#EC4899')}
                    onBlur={(e) => (e.target.style.borderColor = '#2E2E50')}
                  />
                  <button
                    onClick={joinWithCode}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: '#22C55E', color: '#08080F', fontFamily: 'Oxanium, sans-serif' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#16A34A')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#22C55E')}
                  >
                    <LinkIcon size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pending state */}
          {coupleLink && coupleLink.status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-7xl mb-6"
              >
                ⏳
              </motion.div>
              <h2 className="text-xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
                Waiting for your partner...
              </h2>
              <p className="text-sm mb-6" style={{ color: '#9B99B8' }}>
                Share this link with your partner to link up
              </p>

              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                style={{ background: '#13131F', border: '1px solid #2E2E50' }}
              >
                <code className="text-sm font-bold tracking-widest" style={{ color: '#F1F0FF', fontFamily: 'Oxanium, sans-serif' }}>
                  {coupleLink.invite_code}
                </code>
                <button onClick={copyInviteLink} style={{ color: codeCopied ? '#22C55E' : '#5C5A7A' }}>
                  {codeCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <p className="text-xs" style={{ color: '#5C5A7A' }}>
                Or share: {typeof window !== 'undefined' ? window.location.origin : ''}/couple/join/{coupleLink.invite_code}
              </p>
            </motion.div>
          )}

          {/* Active couple dashboard */}
          {coupleLink && coupleLink.status === 'active' && partner && partnerStats && profile && stats && (
            <div className="space-y-6">
              {/* Center connector */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1A0A1F, #13131F)',
                  border: '1px solid #EC489933',
                }}
              >
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    background: 'radial-gradient(ellipse at center, #EC4899, transparent 70%)',
                  }}
                />
                <div className="relative flex items-center justify-center gap-6 flex-wrap">
                  <div className="text-3xl">{profile.avatar_emoji}</div>
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-4xl"
                    >
                      💑
                    </motion.div>
                    <div className="text-sm font-bold font-display" style={{ color: '#EC4899' }}>
                      {daysSince(coupleLink.created_at)} days together
                    </div>
                    <div className="text-xs" style={{ color: '#9B99B8' }}>
                      ⚡ {coupleLink.shared_xp} Shared XP earned together
                    </div>
                  </div>
                  <div className="text-3xl">{partner.avatar_emoji}</div>
                </div>
              </motion.div>

              {/* Split Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfilePanel
                  profile={profile as PartnerProfile}
                  stats={stats}
                  questsDone={completions_today.length}
                  questsTotal={habits.length}
                  weeklyXp={myWeeklyXp}
                  isMe={true}
                />
                <ProfilePanel
                  profile={partner}
                  stats={partnerStats}
                  questsDone={partnerQuestsDone}
                  questsTotal={partnerQuestsTotal}
                  weeklyXp={partnerWeeklyXp}
                  isMe={false}
                />
              </div>

              {/* Weekly Report Card */}
              <div ref={reportRef}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl"
                  style={{ background: '#13131F', border: '1px solid #2E2E50' }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Crown size={18} style={{ color: '#F59E0B' }} />
                      <h3 className="font-bold font-display" style={{ color: '#F1F0FF' }}>
                        Weekly Report Card
                      </h3>
                    </div>
                    <button
                      onClick={shareReport}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: '#7C3AED',
                        color: '#fff',
                        fontFamily: 'Oxanium, sans-serif',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#6D28D9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#7C3AED')}
                    >
                      📸 Save as Image
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* XP Leader */}
                    <div className="p-4 rounded-xl text-center" style={{ background: '#0F0F1A' }}>
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-xs mb-2" style={{ color: '#9B99B8' }}>XP This Week</div>
                      <div className="flex items-center justify-center gap-3">
                        <div>
                          <div className="text-xs" style={{ color: '#7C3AED' }}>{profile.display_name}</div>
                          <div className="font-bold text-lg" style={{ color: '#9F67FF', fontFamily: 'Oxanium, sans-serif' }}>
                            {myWeeklyXp}
                          </div>
                        </div>
                        <span style={{ color: '#5C5A7A' }}>vs</span>
                        <div>
                          <div className="text-xs" style={{ color: '#EC4899' }}>{partner.display_name}</div>
                          <div className="font-bold text-lg" style={{ color: '#F9A8D4', fontFamily: 'Oxanium, sans-serif' }}>
                            {partnerWeeklyXp}
                          </div>
                        </div>
                      </div>
                      {myWeeklyXp !== partnerWeeklyXp && (
                        <div className="text-xs mt-2 font-bold" style={{ color: '#F59E0B' }}>
                          👑 {myWeeklyXp > partnerWeeklyXp ? profile.display_name : partner.display_name} wins!
                        </div>
                      )}
                    </div>

                    {/* Combined XP */}
                    <div className="p-4 rounded-xl text-center" style={{ background: '#0F0F1A' }}>
                      <div className="text-2xl mb-1">💑</div>
                      <div className="text-xs mb-2" style={{ color: '#9B99B8' }}>Power Couple Score</div>
                      <div
                        className="text-3xl font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontFamily: 'Oxanium, sans-serif',
                        }}
                      >
                        {myWeeklyXp + partnerWeeklyXp}
                      </div>
                      <div className="text-xs mt-1" style={{ color: '#9B99B8' }}>Combined XP</div>
                    </div>

                    {/* Streak Comparison */}
                    <div className="p-4 rounded-xl text-center" style={{ background: '#0F0F1A' }}>
                      <div className="text-2xl mb-1">🔥</div>
                      <div className="text-xs mb-2" style={{ color: '#9B99B8' }}>Streaks</div>
                      <div className="flex items-center justify-center gap-3">
                        <div>
                          <div className="text-xs" style={{ color: '#7C3AED' }}>{profile.display_name}</div>
                          <div className="font-bold text-lg" style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}>
                            {profile.streak}🔥
                          </div>
                        </div>
                        <span style={{ color: '#5C5A7A' }}>vs</span>
                        <div>
                          <div className="text-xs" style={{ color: '#EC4899' }}>{partner.display_name}</div>
                          <div className="font-bold text-lg" style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}>
                            {partner.streak}🔥
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sync Check */}
                  {completions_today.length >= habits.length && habits.length > 0 &&
                    partnerQuestsDone >= partnerQuestsTotal && partnerQuestsTotal > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 p-4 rounded-xl text-center"
                      style={{
                        background: 'linear-gradient(135deg, #22C55E22, #16A34A11)',
                        border: '1px solid #22C55E44',
                      }}
                    >
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="font-bold font-display" style={{ color: '#22C55E' }}>
                        Perfect Sync!
                      </div>
                      <div className="text-sm" style={{ color: '#9B99B8' }}>
                        Both of you completed all quests today! +25 bonus XP each 🎉
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Couple Reactions */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={18} style={{ color: '#EC4899' }} />
                  <h3 className="font-bold font-display" style={{ color: '#F1F0FF' }}>
                    Send a Reaction
                  </h3>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {['💪', '🔥', '😍', '👑', '❤️'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={async () => {
                        if (!profile?.id || !partner?.id) return
                        try {
                          await supabase.rpc('send_reaction', {
                            p_from_user: profile.id,
                            p_to_user: partner.id,
                            p_completion_id: null,
                            p_emoji: emoji,
                          })
                        } catch { /* ok */ }
                        toast.success(`${emoji} sent to ${partner.display_name}!`)
                      }}
                      className="text-2xl px-4 py-3 rounded-xl transition-all duration-200"
                      style={{ background: '#1E1E35' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2E2E50'
                        e.currentTarget.style.transform = 'scale(1.2) rotate(5deg)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1E1E35'
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: '#5C5A7A' }}>
                  Reactions appear in {partner.display_name}&apos;s notification feed
                </p>
              </motion.div>

              {/* Couple XP Counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{ background: '#13131F', border: '1px solid #EC489933' }}
              >
                <div className="flex items-center gap-3">
                  <Zap size={20} style={{ color: '#EC4899' }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#F1F0FF' }}>
                      Shared Journey XP
                    </div>
                    <div className="text-xs" style={{ color: '#9B99B8' }}>
                      Total XP earned as a couple
                    </div>
                  </div>
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'Oxanium, sans-serif',
                  }}
                >
                  {coupleLink.shared_xp}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
