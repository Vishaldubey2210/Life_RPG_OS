'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Copy, Share2, Check, Swords,
  Plus, Link as LinkIcon, Flame, Zap,
  Crown, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Party {
  id: string
  name: string
  emoji: string
  party_type: 'friends' | 'couple' | 'family'
  invite_code: string
  created_by: string
  max_members: number
  created_at: string
}

interface PartyMember {
  id: string
  user_id: string
  role: 'leader' | 'member'
  profile: {
    display_name: string
    avatar_emoji: string
    level: number
    streak: number
    hp: number
    hp_max: number
  }
  quests_done_today: number
  quests_total: number
  last_active?: string
}

interface ActivityEvent {
  id: string
  type: 'completion' | 'levelup' | 'streak' | 'reaction'
  user_name: string
  user_avatar: string
  message: string
  xp?: number
  timestamp: string
  border_color: string
}

interface Habit {
  id: string
  name: string
  emoji: string
  stat_category: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function isActiveNow(lastActive?: string): boolean {
  if (!lastActive) return false
  return Date.now() - new Date(lastActive).getTime() < 3600000 // within last hour
}

const PARTY_TYPE_LABELS: Record<string, string> = {
  friends: '👥 Friends',
  couple: '💑 Couple',
  family: '👨‍👩‍👧 Family',
}

const REACTIONS = ['🔥', '💪', '🎉', '⚡', '👑']

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="p-4 rounded-2xl animate-pulse" style={{ background: '#13131F', border: '1px solid #1E1E35' }}>
      <div className="h-16 rounded-xl mb-3" style={{ background: '#1E1E35' }} />
      <div className="h-4 rounded w-2/3 mb-2" style={{ background: '#1E1E35' }} />
      <div className="h-3 rounded w-1/2" style={{ background: '#1E1E35' }} />
    </div>
  )
}

function HPBar({ hp, hpMax }: { hp: number; hpMax: number }) {
  const pct = Math.max(0, Math.min(100, (hp / (hpMax || 100)) * 100))
  const color = pct > 60 ? '#22C55E' : pct > 30 ? '#F59E0B' : '#EF4444'
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

function MemberCard({
  member,
  currentUserId,
  onReact,
}: {
  member: PartyMember
  currentUserId: string
  onReact: (userId: string, emoji: string) => void
}) {
  const active = isActiveNow(member.last_active)
  const isMe = member.user_id === currentUserId
  const questPct = member.quests_total > 0
    ? (member.quests_done_today / member.quests_total) * 100
    : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl relative overflow-hidden"
      style={{
        background: '#13131F',
        border: `1px solid ${active ? '#22C55E44' : isMe ? '#7C3AED44' : '#1E1E35'}`,
        boxShadow: active ? '0 0 20px #22C55E11' : isMe ? '0 0 20px #7C3AED11' : 'none',
      }}
    >
      {active && (
        <div
          className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: '#22C55E22', color: '#22C55E', fontFamily: 'Oxanium, sans-serif' }}
        >
          ⚡ Active
        </div>
      )}

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{member.profile?.avatar_emoji ?? '⚔️'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold truncate" style={{ color: '#F1F0FF' }}>
              {member.profile?.display_name ?? 'Unknown'}
            </span>
            {isMe && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: '#7C3AED33', color: '#9F67FF', fontFamily: 'Oxanium, sans-serif' }}
              >
                You
              </span>
            )}
            {member.role === 'leader' && (
              <Crown size={12} style={{ color: '#F59E0B' }} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: '#9B99B8' }}>
            <span>Lv.{member.profile?.level ?? 1}</span>
            <span>•</span>
            <span style={{ color: '#F59E0B' }}>🔥 {member.profile?.streak ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Quest progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1" style={{ color: '#9B99B8' }}>
          <span>Quests Today</span>
          <span style={{ color: questPct >= 100 ? '#22C55E' : '#F1F0FF' }}>
            {member.quests_done_today}/{member.quests_total}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: questPct >= 100 ? '#22C55E' : 'linear-gradient(90deg, #7C3AED, #9F67FF)',
              width: `${questPct}%`,
            }}
            animate={{ width: `${questPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* HP Bar */}
      <HPBar hp={member.profile?.hp ?? 100} hpMax={member.profile?.hp_max ?? 100} />

      {/* Reaction buttons (only for others) */}
      {!isMe && (
        <div className="flex gap-1 mt-3 flex-wrap">
          {REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onReact(member.user_id, emoji)}
              className="text-sm px-2 py-1 rounded-lg transition-all duration-200"
              style={{ background: '#1E1E35' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2E2E50'
                e.currentTarget.style.transform = 'scale(1.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1E1E35'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="space-y-2">
      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📜</div>
          <div className="text-sm" style={{ color: '#5C5A7A' }}>No party activity yet</div>
        </div>
      ) : (
        events.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: '#0F0F1A',
              borderLeft: `3px solid ${ev.border_color}`,
            }}
          >
            <span className="text-xl flex-shrink-0">{ev.user_avatar}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold" style={{ color: '#F1F0FF' }}>
                {ev.user_name}
              </span>
              <span className="text-xs ml-1" style={{ color: '#9B99B8' }}>
                {ev.message}
              </span>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: '#5C5A7A' }}>
              {timeAgo(ev.timestamp)}
            </span>
          </motion.div>
        ))
      )}
    </div>
  )
}

// ─── No-Party Screen ──────────────────────────────────────────────────────────

function NoPartyScreen({ onCreated }: { onCreated: () => void }) {
  const supabase = createClient()
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle')
  const [partyName, setPartyName] = useState('')
  const [partyType, setPartyType] = useState<'friends' | 'couple' | 'family'>('friends')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!partyName.trim()) { toast.error('Enter a party name'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: party, error: partyErr } = await supabase
        .from('parties')
        .insert({
          name: partyName.trim(),
          party_type: partyType,
          emoji: partyType === 'couple' ? '💑' : partyType === 'family' ? '👨‍👩‍👧' : '👥',
          created_by: user.id,
        })
        .select()
        .single()

      if (partyErr) throw partyErr

      await supabase.from('party_members').insert({
        party_id: party.id,
        user_id: user.id,
        role: 'leader',
      })

      toast.success(`⚔️ Party "${partyName}" created!`)
      onCreated()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create party')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) { toast.error('Enter an invite code'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: party, error: findErr } = await supabase
        .from('parties')
        .select('*')
        .eq('invite_code', joinCode.toUpperCase())
        .single()

      if (findErr || !party) throw new Error('Party not found. Check the invite code.')

      // Check member count
      const { count } = await supabase
        .from('party_members')
        .select('*', { count: 'exact' })
        .eq('party_id', party.id)

      if ((count ?? 0) >= party.max_members) throw new Error('This party is full!')

      const { error: joinErr } = await supabase.from('party_members').insert({
        party_id: party.id,
        user_id: user.id,
        role: 'member',
      })

      if (joinErr) throw joinErr

      toast.success(`🎉 Joined "${party.name}"!`)
      onCreated()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join party')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      {/* Empty State */}
      <div className="text-center mb-10">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-7xl mb-4"
        >
          👥
        </motion.div>
        <h2 className="text-2xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
          Adventure is better with others
        </h2>
        <p style={{ color: '#9B99B8' }}>Create a party or join with an invite code</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Create Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 rounded-2xl cursor-pointer"
          style={{
            background: '#13131F',
            border: `2px solid ${mode === 'create' ? '#7C3AED' : '#1E1E35'}`,
          }}
          onClick={() => setMode(mode === 'create' ? 'idle' : 'create')}
        >
          <div className="text-3xl mb-3">⚔️</div>
          <h3 className="font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>Start a Party</h3>
          <p className="text-sm mb-4" style={{ color: '#9B99B8' }}>
            Create a new party and invite your friends
          </p>

          <AnimatePresence>
            {mode === 'create' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="Party name..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-3 outline-none"
                  style={{
                    background: '#0F0F1A',
                    border: '1px solid #2E2E50',
                    color: '#F1F0FF',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                  onBlur={(e) => (e.target.style.borderColor = '#2E2E50')}
                />

                <div className="flex gap-2 mb-4">
                  {[
                    { value: 'friends', label: '👥 Friends' },
                    { value: 'couple', label: '💑 Couple' },
                    { value: 'family', label: '👨‍👩‍👧 Family' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setPartyType(value as 'friends' | 'couple' | 'family')}
                      className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-all"
                      style={{
                        background: partyType === value ? '#7C3AED' : '#1E1E35',
                        color: partyType === value ? '#fff' : '#9B99B8',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: loading ? '#5C5A7A' : '#7C3AED',
                    color: '#fff',
                    fontFamily: 'Oxanium, sans-serif',
                    boxShadow: loading ? 'none' : '0 0 20px #7C3AED44',
                  }}
                >
                  {loading ? 'Creating...' : 'Create Party ⚔️'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {mode !== 'create' && (
            <div
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}
            >
              <Plus size={14} /> Create
            </div>
          )}
        </motion.div>

        {/* Join Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 rounded-2xl cursor-pointer"
          style={{
            background: '#13131F',
            border: `2px solid ${mode === 'join' ? '#22C55E' : '#1E1E35'}`,
          }}
          onClick={() => setMode(mode === 'join' ? 'idle' : 'join')}
        >
          <div className="text-3xl mb-3">🔗</div>
          <h3 className="font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>Join with Code</h3>
          <p className="text-sm mb-4" style={{ color: '#9B99B8' }}>
            Enter an 8-character invite code to join
          </p>

          <AnimatePresence>
            {mode === 'join' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC12345"
                  maxLength={8}
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-4 outline-none text-center tracking-widest font-bold uppercase"
                  style={{
                    background: '#0F0F1A',
                    border: '1px solid #2E2E50',
                    color: '#F1F0FF',
                    fontFamily: 'Oxanium, sans-serif',
                    letterSpacing: '0.3em',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#22C55E')}
                  onBlur={(e) => (e.target.style.borderColor = '#2E2E50')}
                />

                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: loading ? '#5C5A7A' : '#22C55E',
                    color: loading ? '#fff' : '#08080F',
                    fontFamily: 'Oxanium, sans-serif',
                    boxShadow: loading ? 'none' : '0 0 20px #22C55E44',
                  }}
                >
                  {loading ? 'Joining...' : 'Join Party 🔗'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {mode !== 'join' && (
            <div
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: '#22C55E', fontFamily: 'Oxanium, sans-serif' }}
            >
              <LinkIcon size={14} /> Join
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Share Habit Modal ─────────────────────────────────────────────────────────

function ShareQuestModal({
  habits,
  partyId,
  currentUserId,
  onClose,
}: {
  habits: Habit[]
  partyId: string
  currentUserId: string
  onClose: () => void
}) {
  const supabase = createClient()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    if (!selected) return
    setLoading(true)
    try {
      await supabase.from('shared_habits').insert({
        party_id: partyId,
        habit_id: selected,
        shared_by: currentUserId,
      })
      toast.success('Quest shared with party! 👥')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to share quest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#13131F', border: '1px solid #2E2E50' }}
      >
        <h3 className="font-bold text-lg mb-1 font-display" style={{ color: '#F1F0FF' }}>
          Share a Quest 👥
        </h3>
        <p className="text-sm mb-4" style={{ color: '#9B99B8' }}>
          Shared quests appear in all members&apos; quest lists.
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelected(h.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
              style={{
                background: selected === h.id ? '#7C3AED22' : '#0F0F1A',
                border: `1px solid ${selected === h.id ? '#7C3AED' : '#1E1E35'}`,
                color: '#F1F0FF',
              }}
            >
              <span className="text-xl">{h.emoji}</span>
              <span className="text-sm">{h.name}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
            style={{ background: '#1E1E35', color: '#9B99B8' }}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selected || loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: selected && !loading ? '#7C3AED' : '#5C5A7A',
              color: '#fff',
              fontFamily: 'Oxanium, sans-serif',
            }}
          >
            {loading ? 'Sharing...' : 'Share Quest'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PartyPage() {
  const supabase = createClient()
  const { profile, habits, completions_today, loading: profileLoading } = useProfile()

  const [party, setParty] = useState<Party | null>(null)
  const [members, setMembers] = useState<PartyMember[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [partyLoading, setPartyLoading] = useState(true)
  const [codeCopied, setCodeCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'quests'>('members')

  const fetchPartyData = useCallback(async () => {
    if (!profile?.id) return
    setPartyLoading(true)

    try {
      const { data: membership } = await supabase
        .from('party_members')
        .select('party_id')
        .eq('user_id', profile.id)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!membership) {
        setParty(null)
        setPartyLoading(false)
        return
      }

      const { data: partyData } = await supabase
        .from('parties')
        .select('*')
        .eq('id', membership.party_id)
        .single()

      setParty(partyData)

      const { data: memberData } = await supabase
        .from('party_members')
        .select(`
          id, user_id, role, joined_at,
          profiles:user_id (display_name, avatar_emoji, level, streak, hp, hp_max)
        `)
        .eq('party_id', membership.party_id)

      const today = new Date().toISOString().split('T')[0]
      const memberIds = (memberData ?? []).map((m: { user_id: string }) => m.user_id)

      let completionsMap: Record<string, number> = {}
      let totalMap: Record<string, number> = {}
      let lastActiveMap: Record<string, string> = {}

      if (memberIds.length > 0) {
        const [{ data: compData }, { data: habitData }, { data: latestCompletion }] = await Promise.all([
          supabase
            .from('habit_completions')
            .select('user_id')
            .in('user_id', memberIds)
            .gte('completed_at', `${today}T00:00:00`),
          supabase
            .from('habits')
            .select('user_id')
            .in('user_id', memberIds)
            .eq('is_active', true),
          supabase
            .from('habit_completions')
            .select('user_id, completed_at')
            .in('user_id', memberIds)
            .order('completed_at', { ascending: false })
            .limit(memberIds.length * 3),
        ])

        completionsMap = (compData ?? []).reduce((acc: Record<string, number>, c: { user_id: string }) => {
          acc[c.user_id] = (acc[c.user_id] ?? 0) + 1; return acc
        }, {})

        totalMap = (habitData ?? []).reduce((acc: Record<string, number>, h: { user_id: string }) => {
          acc[h.user_id] = (acc[h.user_id] ?? 0) + 1; return acc
        }, {})

        ;(latestCompletion ?? []).forEach((c: { user_id: string; completed_at: string }) => {
          if (!lastActiveMap[c.user_id]) lastActiveMap[c.user_id] = c.completed_at
        })
      }

      const enriched: PartyMember[] = (memberData ?? []).map((m: {
        id: string
        user_id: string
        role: 'leader' | 'member'
        joined_at: string
        profiles: {
          display_name: string
          avatar_emoji: string
          level: number
          streak: number
          hp: number
          hp_max: number
        } | {
          display_name: string
          avatar_emoji: string
          level: number
          streak: number
          hp: number
          hp_max: number
        }[]
      }) => ({
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
        quests_done_today: completionsMap[m.user_id] ?? 0,
        quests_total: totalMap[m.user_id] ?? 0,
        last_active: lastActiveMap[m.user_id],
      }))

      setMembers(enriched)

      // Build activity feed
      if (memberIds.length > 0) {
        const { data: recentData } = await supabase
          .from('habit_completions')
          .select(`id, user_id, completed_at, habits:habit_id (name, xp_reward)`)
          .in('user_id', memberIds)
          .order('completed_at', { ascending: false })
          .limit(20)

        const profileMap: Record<string, { display_name: string; avatar_emoji: string }> = {}
        enriched.forEach(m => { profileMap[m.user_id] = m.profile })

        const events: ActivityEvent[] = (recentData ?? []).map((c: {
          id: string
          user_id: string
          completed_at: string
          habits: { name: string; xp_reward: number } | { name: string; xp_reward: number }[]
        }) => {
          const p = profileMap[c.user_id] ?? { display_name: 'Unknown', avatar_emoji: '⚔️' }
          const h = Array.isArray(c.habits) ? c.habits[0] : c.habits
          return {
            id: c.id,
            type: 'completion' as const,
            user_name: p.display_name,
            user_avatar: p.avatar_emoji,
            message: `completed ${h?.name ?? 'a quest'} +${h?.xp_reward ?? 0} XP 🎯`,
            xp: h?.xp_reward ?? 0,
            timestamp: c.completed_at,
            border_color: '#22C55E',
          }
        })

        setActivity(events)
      }
    } finally {
      setPartyLoading(false)
    }
  }, [profile?.id, supabase])

  useEffect(() => {
    if (profile?.id) {
      fetchPartyData()
    }
  }, [profile?.id, fetchPartyData])

  // Realtime subscription for party activity
  useEffect(() => {
    if (!party?.id || !members.length) return
    const memberIds = members.map(m => m.user_id)

    const channel = supabase
      .channel(`party:${party.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'habit_completions' },
        async (payload: any) => {
          const completion = payload.new as { user_id: string; habit_id: string; completed_at: string; id: string }
          if (!memberIds.includes(completion.user_id)) return

          const member = members.find(m => m.user_id === completion.user_id)
          if (!member) return

          const { data: habitData } = await supabase
            .from('habits')
            .select('name, xp_reward')
            .eq('id', completion.habit_id)
            .single()

          const newEvent: ActivityEvent = {
            id: completion.id,
            type: 'completion',
            user_name: member.profile.display_name,
            user_avatar: member.profile.avatar_emoji,
            message: `completed ${habitData?.name ?? 'a quest'} +${habitData?.xp_reward ?? 0} XP 🎯`,
            xp: habitData?.xp_reward ?? 0,
            timestamp: completion.completed_at,
            border_color: '#22C55E',
          }

          setActivity(prev => [newEvent, ...prev].slice(0, 20))
          toast.success(`${member.profile.avatar_emoji} ${member.profile.display_name} completed a quest! 🎯`)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [party?.id, members, supabase])

  async function handleReact(toUserId: string, emoji: string) {
    if (!profile?.id) return
    try {
      await supabase.rpc('send_reaction', {
        p_from_user: profile.id,
        p_to_user: toUserId,
        p_completion_id: null,
        p_emoji: emoji,
      })
      toast.success(`${emoji} reaction sent!`)
    } catch {
      // If RPC doesn't exist yet, just show toast
      toast.success(`${emoji} sent to party member!`)
    }
  }

  function copyInviteCode() {
    if (!party) return
    navigator.clipboard.writeText(party.invite_code)
    setCodeCopied(true)
    toast.success('Invite code copied! 📋')
    setTimeout(() => setCodeCopied(false), 2000)
  }

  function sharePartyLink() {
    if (!party) return
    const url = `${window.location.origin}/party/join/${party.invite_code}`
    navigator.clipboard.writeText(`Join my party on Life RPG OS! Code: ${party.invite_code} → ${url}`)
    toast.success('Share link copied! 🔗')
  }

  const loading = profileLoading || partyLoading

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ background: '#08080F' }}>
        <Sidebar userAvatar={profile?.avatar_emoji ?? '⚔️'} userName={profile?.display_name ?? 'Adventurer'} userLevel={profile?.level ?? 1} />
        <main className="flex-1 p-6 pt-20" style={{ marginLeft: 240 }}>
          <div className="max-w-6xl mx-auto">
            <div className="h-8 rounded w-48 mb-2 animate-pulse" style={{ background: '#13131F' }} />
            <div className="h-4 rounded w-64 mb-8 animate-pulse" style={{ background: '#13131F' }} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
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
        completedToday={completions_today.length}
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
              Party System 👥
            </h1>
            <p style={{ color: '#9B99B8' }}>
              Team up, share quests, and conquer goals together.
            </p>
          </div>

          {/* No party yet */}
          {!party ? (
            <NoPartyScreen onCreated={fetchPartyData} />
          ) : (
            <div className="space-y-6">
              {/* Party Header Card */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #13131F, #1A1025)',
                  border: '1px solid #2E2E50',
                  boxShadow: '0 0 40px #7C3AED11',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
                  style={{ background: '#7C3AED' }}
                />

                <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{party.emoji}</div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-bold font-display" style={{ color: '#F1F0FF' }}>
                          {party.name}
                        </h2>
                        <span
                          className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{
                            background: '#7C3AED22',
                            color: '#9F67FF',
                            fontFamily: 'Oxanium, sans-serif',
                          }}
                        >
                          {PARTY_TYPE_LABELS[party.party_type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: '#9B99B8' }}>
                        <Users size={14} />
                        <span>{members.length} / {party.max_members} members</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:ml-auto flex-wrap">
                    {/* Invite Code */}
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{ background: '#0F0F1A', border: '1px solid #2E2E50' }}
                    >
                      <span className="text-xs" style={{ color: '#5C5A7A' }}>Code</span>
                      <span
                        className="text-sm font-bold tracking-widest"
                        style={{ color: '#F1F0FF', fontFamily: 'Oxanium, sans-serif' }}
                      >
                        {party.invite_code}
                      </span>
                      <button onClick={copyInviteCode} className="transition-all" style={{ color: codeCopied ? '#22C55E' : '#5C5A7A' }}>
                        {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>

                    <button
                      onClick={sharePartyLink}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: '#7C3AED',
                        color: '#fff',
                        fontFamily: 'Oxanium, sans-serif',
                        boxShadow: '0 0 15px #7C3AED44',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#6D28D9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#7C3AED')}
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="flex gap-2">
                {[
                  { key: 'members', label: '⚔️ Members' },
                  { key: 'activity', label: '📜 Activity' },
                  { key: 'quests', label: '👥 Shared Quests' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: activeTab === key ? '#7C3AED' : '#13131F',
                      color: activeTab === key ? '#fff' : '#9B99B8',
                      border: `1px solid ${activeTab === key ? '#7C3AED' : '#1E1E35'}`,
                      fontFamily: 'Oxanium, sans-serif',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'members' && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  >
                    {members.map(member => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        currentUserId={profile?.id ?? ''}
                        onReact={handleReact}
                      />
                    ))}
                  </motion.div>
                )}

                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="p-6 rounded-2xl"
                    style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Flame size={18} style={{ color: '#EF4444' }} />
                      <h3 className="font-bold font-display" style={{ color: '#F1F0FF' }}>
                        Party Activity Feed
                      </h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#22C55E22', color: '#22C55E' }}
                      >
                        Live ⚡
                      </span>
                    </div>
                    <ActivityFeed events={activity} />
                  </motion.div>
                )}

                {activeTab === 'quests' && (
                  <motion.div
                    key="quests"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="p-6 rounded-2xl"
                    style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Zap size={18} style={{ color: '#F59E0B' }} />
                        <h3 className="font-bold font-display" style={{ color: '#F1F0FF' }}>
                          Shared Quests
                        </h3>
                      </div>
                      {party.created_by === profile?.id && (
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                          style={{
                            background: '#7C3AED',
                            color: '#fff',
                            fontFamily: 'Oxanium, sans-serif',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#6D28D9')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#7C3AED')}
                        >
                          <Plus size={14} />
                          Share a Quest
                        </button>
                      )}
                    </div>

                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🎯</div>
                      <p className="text-sm" style={{ color: '#9B99B8' }}>
                        {party.created_by === profile?.id
                          ? 'Share one of your quests with your party. All members get 50% bonus XP when completed.'
                          : 'The party leader can share quests here. Check back soon!'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Party Boss Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1A0A0A, #13131F)',
                  border: '1px solid #EF444433',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: '#EF4444' }}
                />
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">😈</div>
                    <div>
                      <div
                        className="text-xs font-bold mb-1"
                        style={{ color: '#EF4444', fontFamily: 'Oxanium, sans-serif' }}
                      >
                        ⚔️ PARTY BOSS
                      </div>
                      <div className="text-lg font-bold font-display" style={{ color: '#F1F0FF' }}>
                        Procrastination Demon
                      </div>
                      <div className="text-sm mt-1" style={{ color: '#9B99B8' }}>
                        Defeat by completing all quests this week • Reward: 500 bonus XP each
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="flex justify-between text-xs mb-1" style={{ color: '#9B99B8' }}>
                      <span>Party Progress</span>
                      <span style={{ color: '#EF4444' }}>
                        {members.reduce((a, m) => a + m.quests_done_today, 0)} / {members.reduce((a, m) => a + m.quests_total, 0)} quests
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, #EF4444, #F59E0B)',
                          width: `${members.reduce((a, m) => a + m.quests_total, 0) > 0
                            ? (members.reduce((a, m) => a + m.quests_done_today, 0) / members.reduce((a, m) => a + m.quests_total, 0)) * 100
                            : 0}%`,
                        }}
                        animate={{ width: `${members.reduce((a, m) => a + m.quests_total, 0) > 0
                          ? (members.reduce((a, m) => a + m.quests_done_today, 0) / members.reduce((a, m) => a + m.quests_total, 0)) * 100
                          : 0}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Couple Mode CTA */}
              {party.party_type === 'couple' && (
                <motion.a
                  href="/party/couple"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between p-5 rounded-2xl transition-all duration-200 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #1A0A1F, #13131F)',
                    border: '1px solid #EC489933',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#EC4899')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#EC489933')}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">💑</div>
                    <div>
                      <div className="font-bold font-display" style={{ color: '#F1F0FF' }}>
                        Couple Mode
                      </div>
                      <div className="text-sm" style={{ color: '#9B99B8' }}>
                        Link up with your partner for a shared dashboard & sync tracking
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} style={{ color: '#EC4899' }} />
                </motion.a>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Share Quest Modal */}
      <AnimatePresence>
        {showShareModal && party && profile && (
          <ShareQuestModal
            habits={habits as Habit[]}
            partyId={party.id}
            currentUserId={profile.id}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
