'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Share2, Copy, Check, Swords } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface PageProps {
  params: Promise<{ username: string }>
}

interface PublicProfile {
  id: string
  display_name: string
  avatar_emoji: string
  level: number
  xp: number
  xp_to_next: number
  streak: number
  created_at: string
}

interface PublicStats {
  str: number
  int: number
  wis: number
  vit: number
  gold: number
  cha: number
}

interface RecentActivity {
  id: string
  habit_name: string
  completed_at: string
  xp_reward: number
}

const STAT_CONFIG = [
  { key: 'str',  label: 'STR',  icon: '💪', color: '#EF4444' },
  { key: 'int',  label: 'INT',  icon: '🧠', color: '#3B82F6' },
  { key: 'wis',  label: 'WIS',  icon: '🧘', color: '#22C55E' },
  { key: 'vit',  label: 'VIT',  icon: '❤️', color: '#EF4444' },
  { key: 'gold', label: 'GOLD', icon: '💰', color: '#F59E0B' },
  { key: 'cha',  label: 'CHA',  icon: '🗣️', color: '#9F67FF' },
]

function memberSince(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${days}d ago`
}

function StatBar({ value, color, label, icon }: { value: number; color: string; label: string; icon: string }) {
  const pct = Math.min(100, (value / 50) * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-4">{icon}</span>
      <span className="text-xs font-semibold w-8" style={{ color: '#9B99B8', fontFamily: 'Oxanium, sans-serif' }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, width: `${pct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />
      </div>
      <span className="text-xs w-5 text-right" style={{ color: '#F1F0FF' }}>{value}</span>
    </div>
  )
}

export default function PublicProfilePage({ params }: PageProps) {
  const supabase = createClient()
  const router = useRouter()
  const [username, setUsername] = useState<string>('')
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [urlCopied, setUrlCopied] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setUsername(decodeURIComponent(p.username)))
  }, [params])

  useEffect(() => {
    if (!username) return

    async function fetchProfile() {
      setLoading(true)
      try {
        // Check current user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)

        // Find profile by display_name (username field)
        // We search by display_name since we don't have a username column
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .ilike('display_name', username)
          .limit(1)
          .maybeSingle()

        if (profileErr || !profileData) {
          // Try by ID as fallback
          const { data: byId } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', username)
            .maybeSingle()

          if (!byId) {
            setError('Profile not found.')
            setLoading(false)
            return
          }
          setProfile(byId)
          await fetchSecondary(byId.id)
          return
        }

        setProfile(profileData)
        await fetchSecondary(profileData.id)
      } catch {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    async function fetchSecondary(userId: string) {
      const [{ data: statsData }, { data: recentData }] = await Promise.all([
        supabase.from('stats').select('*').eq('user_id', userId).single(),
        supabase
          .from('habit_completions')
          .select('id, completed_at, habits:habit_id(name, xp_reward)')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(7),
      ])

      if (statsData) setStats(statsData)

      const mappedActivity: RecentActivity[] = (recentData ?? []).map((c: {
        id: string
        completed_at: string
        habits: { name: string; xp_reward: number } | { name: string; xp_reward: number }[]
      }) => {
        const h = Array.isArray(c.habits) ? c.habits[0] : c.habits
        return {
          id: c.id,
          habit_name: h?.name ?? 'A quest',
          completed_at: c.completed_at,
          xp_reward: h?.xp_reward ?? 0,
        }
      })

      setActivity(mappedActivity)
    }

    fetchProfile()
  }, [username, supabase])

  async function handleChallenge() {
    if (!currentUserId || !profile) return
    if (currentUserId === profile.id) { toast.error("You can't challenge yourself!"); return }

    try {
      const { data: party } = await supabase
        .from('parties')
        .insert({
          name: `${profile.display_name}'s Challenge`,
          emoji: '⚔️',
          party_type: 'friends',
          created_by: currentUserId,
        })
        .select()
        .single()

      if (!party) throw new Error('Failed to create challenge party')

      await supabase.from('party_members').insert({
        party_id: party.id,
        user_id: currentUserId,
        role: 'leader',
      })

      // Send notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'party_invite',
        from_user_id: currentUserId,
        title: 'Challenge Incoming! ⚔️',
        body: `You've been challenged to a party on Life RPG OS! Code: ${party.invite_code}`,
        data: { party_id: party.id, invite_code: party.invite_code },
      })

      toast.success(`⚔️ Challenge sent to ${profile.display_name}! Party code: ${party.invite_code}`)
      router.push('/party')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send challenge')
    }
  }

  function copyProfileUrl() {
    navigator.clipboard.writeText(window.location.href)
    setUrlCopied(true)
    toast.success('Profile URL copied! 🔗')
    setTimeout(() => setUrlCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">⚔️</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Loading profile...
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080F' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>Profile Not Found</h2>
          <p className="text-sm mb-6" style={{ color: '#9B99B8' }}>{error}</p>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl font-bold text-sm inline-block"
            style={{ background: '#7C3AED', color: '#fff', fontFamily: 'Oxanium, sans-serif' }}
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    )
  }

  const xpPct = profile.xp_to_next > 0 ? (profile.xp / profile.xp_to_next) * 100 : 0

  return (
    <div className="min-h-screen" style={{ background: '#08080F' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 h-14"
        style={{
          background: 'rgba(8,8,15,0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #1E1E35',
        }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm"
          style={{ color: '#9B99B8' }}
        >
          ⚔️ <span style={{ fontFamily: 'Oxanium, sans-serif' }}>Life RPG OS</span>
        </Link>
        <div className="flex items-center gap-2">
          {currentUserId && currentUserId !== profile.id && (
            <button
              onClick={handleChallenge}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: '#7C3AED',
                color: '#fff',
                fontFamily: 'Oxanium, sans-serif',
                boxShadow: '0 0 15px #7C3AED44',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#7C3AED')}
            >
              <Swords size={14} />
              Challenge to Party
            </button>
          )}
          <button
            onClick={copyProfileUrl}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all"
            style={{
              background: '#13131F',
              color: urlCopied ? '#22C55E' : '#9B99B8',
              border: '1px solid #1E1E35',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2E2E50')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1E1E35')}
          >
            {urlCopied ? <Check size={14} /> : <Share2 size={14} />}
            {urlCopied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl mb-6 relative overflow-hidden text-center"
          style={{
            background: '#13131F',
            border: '1px solid #2E2E50',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: '#7C3AED' }}
          />

          <div className="relative">
            <div className="text-7xl mb-4">{profile.avatar_emoji}</div>
            <h1 className="text-2xl font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
              {profile.display_name}
            </h1>
            <div
              className="text-sm mb-1"
              style={{ color: '#9B99B8' }}
            >
              @{profile.display_name.toLowerCase().replace(/\s+/g, '_')}
            </div>
            <div className="text-xs mb-4" style={{ color: '#5C5A7A' }}>
              Member since {memberSince(profile.created_at)}
            </div>

            {/* Level Badge */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="px-4 py-1.5 rounded-full text-sm font-bold"
                style={{
                  background: '#7C3AED22',
                  color: '#9F67FF',
                  border: '1px solid #7C3AED44',
                  fontFamily: 'Oxanium, sans-serif',
                }}
              >
                ⚔️ Level {profile.level}
              </div>
              <div
                className="px-4 py-1.5 rounded-full text-sm font-bold"
                style={{
                  background: '#F59E0B22',
                  color: '#F59E0B',
                  border: '1px solid #F59E0B44',
                  fontFamily: 'Oxanium, sans-serif',
                }}
              >
                🔥 {profile.streak} streak
              </div>
            </div>

            {/* XP Bar */}
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9B99B8' }}>
                <span>XP Progress</span>
                <span style={{ color: '#9F67FF' }}>{profile.xp} / {profile.xp_to_next}</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #7C3AED, #9F67FF)',
                    width: `${xpPct}%`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl mb-6"
            style={{ background: '#13131F', border: '1px solid #1E1E35' }}
          >
            <h2 className="font-bold mb-4 font-display" style={{ color: '#F1F0FF' }}>
              ⚔️ Character Stats
            </h2>
            <div className="space-y-3">
              {STAT_CONFIG.map(({ key, label, icon, color }) => (
                <StatBar
                  key={key}
                  value={stats[key as keyof PublicStats] ?? 1}
                  color={color}
                  label={label}
                  icon={icon}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl mb-6"
          style={{ background: '#13131F', border: '1px solid #1E1E35' }}
        >
          <h2 className="font-bold mb-4 font-display" style={{ color: '#F1F0FF' }}>
            📜 Recent Quests (Last 7)
          </h2>
          {activity.length === 0 ? (
            <p className="text-sm" style={{ color: '#5C5A7A' }}>No recent activity</p>
          ) : (
            <div className="space-y-2">
              {activity.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: '#0F0F1A', borderLeft: '3px solid #22C55E' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className="text-sm" style={{ color: '#F1F0FF' }}>
                      {item.habit_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-xs font-bold"
                      style={{ color: '#9F67FF', fontFamily: 'Oxanium, sans-serif' }}
                    >
                      +{item.xp_reward} XP
                    </span>
                    <span className="text-xs" style={{ color: '#5C5A7A' }}>
                      {timeAgo(item.completed_at)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Copy URL */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 p-4 rounded-xl"
          style={{ background: '#13131F', border: '1px solid #1E1E35' }}
        >
          <span className="text-sm" style={{ color: '#9B99B8' }}>Share this profile:</span>
          <button
            onClick={copyProfileUrl}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
            style={{
              background: urlCopied ? '#22C55E22' : '#7C3AED22',
              color: urlCopied ? '#22C55E' : '#9F67FF',
              border: `1px solid ${urlCopied ? '#22C55E44' : '#7C3AED44'}`,
            }}
          >
            {urlCopied ? <Check size={14} /> : <Copy size={14} />}
            {urlCopied ? 'Copied!' : 'Copy Link'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
