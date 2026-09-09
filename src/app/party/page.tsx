'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Copy, Share2, Check, Swords,
  Plus, Link as LinkIcon, Flame, Zap,
  Crown, ChevronRight, HeartHandshake, Scroll, Target, Skull, Award
} from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import DynamicIcon from '@/components/ui/DynamicIcon'
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
  friends: 'Friends',
  couple: 'Couple',
  family: 'Family',
}

const REACTIONS = ['flame', 'dumbbell', 'party_popper', 'zap', 'crown']

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="p-4 rounded-2xl animate-pulse bg-white border border-[#EAE6DD] shadow-xs">
      <div className="h-16 rounded-xl mb-3 bg-[#FAF8F5]" />
      <div className="h-4 rounded w-2/3 mb-2 bg-[#FAF8F5]" />
      <div className="h-3 rounded w-1/2 bg-[#FAF8F5]" />
    </div>
  )
}

function HPBar({ hp, hpMax }: { hp: number; hpMax: number }) {
  const pct = Math.max(0, Math.min(100, (hp / (hpMax || 100)) * 100))
  const color = pct > 60 ? '#10B981' : pct > 30 ? '#F59E0B' : '#EF4444'
  return (
    <div className="h-1.5 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#EAE6DD]">
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
      className={`p-4 rounded-2xl relative overflow-hidden bg-white border shadow-xs ${
        active
          ? 'border-emerald-300 ring-2 ring-emerald-500/10'
          : isMe
          ? 'border-[#5B57F0]/40 ring-2 ring-[#5B57F0]/10'
          : 'border-[#EAE6DD]'
      }`}
    >
      {active && (
        <div
          className="absolute top-2.5 right-2.5 text-2xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200"
        >
          <Zap size={10} /> Active
        </div>
      )}

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 border border-purple-200 text-[#5B57F0] shadow-2xs"
        >
          <DynamicIcon name={member.profile?.avatar_emoji ?? 'swords'} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-[#232019] truncate">
              {member.profile?.display_name ?? 'Unknown'}
            </span>
            {isMe && (
              <span
                className="text-2xs px-1.5 py-0.5 rounded-md font-bold bg-[#EDECFD] text-[#5B57F0]"
              >
                You
              </span>
            )}
            {member.role === 'leader' && (
              <Crown size={13} className="text-amber-500" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6E6A61]">
            <span>Lv.{member.profile?.level ?? 1}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-amber-600">
              <Flame size={12} /> {member.profile?.streak ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Quest progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1 text-[#6E6A61]">
          <span>Quests Today</span>
          <span className={`font-semibold ${questPct >= 100 ? 'text-emerald-600' : 'text-[#232019]'}`}>
            {member.quests_done_today}/{member.quests_total}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#EAE6DD]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: questPct >= 100 ? '#10B981' : 'linear-gradient(90deg, #5B57F0, #8B5CF6)',
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
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onReact(member.user_id, emoji)}
              className="p-1.5 rounded-lg transition-all text-[#6E6A61] hover:text-[#5B57F0] hover:bg-purple-50 flex items-center justify-center bg-[#FAF8F5] border border-[#EAE6DD] hover:border-[#5B57F0]/30 shadow-2xs cursor-pointer"
            >
              <DynamicIcon name={emoji} size={14} />
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
          <div className="flex justify-center mb-2">
            <Scroll className="w-8 h-8 text-[#8A857A]" />
          </div>
          <div className="text-sm text-[#8A857A]">No party activity yet</div>
        </div>
      ) : (
        events.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD] shadow-2xs"
            style={{
              borderLeft: `3px solid ${ev.border_color || '#5B57F0'}`,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-50 text-[#5B57F0]"
            >
              <DynamicIcon name={ev.user_avatar} size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#232019]">
                {ev.user_name}
              </span>
              <span className="text-xs ml-1.5 text-[#6E6A61]">
                {ev.message}
              </span>
            </div>
            <span className="text-2xs text-[#8A857A] flex-shrink-0">
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
          emoji: partyType === 'couple' ? 'couple' : partyType === 'family' ? 'family' : 'friends',
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

      toast.success(`Party "${partyName}" created!`)
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

      toast.success(`Joined "${party.name}"!`)
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
          className="flex justify-center mb-4"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-purple-50 border border-purple-200 text-[#5B57F0] shadow-sm">
            <Users size={38} />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2 text-[#232019]">
          Adventure is better with others
        </h2>
        <p className="text-sm text-[#6E6A61]">Create a party or join with an invite code</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Create Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-2xl cursor-pointer bg-white border shadow-sm transition-all ${
            mode === 'create' ? 'border-[#5B57F0] ring-2 ring-[#5B57F0]/10' : 'border-[#EAE6DD]'
          }`}
          onClick={() => setMode(mode === 'create' ? 'idle' : 'create')}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-purple-50 border border-purple-200 text-[#5B57F0]"
          >
            <Swords size={24} />
          </div>
          <h3 className="font-bold mb-1 text-[#232019]">Start a Party</h3>
          <p className="text-sm mb-4 text-[#6E6A61]">
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
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-3 outline-none bg-[#FAF8F5] border border-[#EAE6DD] text-[#232019] focus:border-[#5B57F0] focus:bg-white"
                />

                <div className="flex gap-2 mb-4">
                  {[
                    { value: 'friends', label: 'Friends' },
                    { value: 'couple', label: 'Couple' },
                    { value: 'family', label: 'Family' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setPartyType(value as 'friends' | 'couple' | 'family')}
                      className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all border ${
                        partyType === value
                          ? 'bg-[#5B57F0] text-white border-[#5B57F0]'
                          : 'bg-[#FAF8F5] text-[#6E6A61] border-[#EAE6DD]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-[#5B57F0] text-white hover:bg-[#4F46E5] shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  <span>{loading ? 'Creating...' : 'Create Party'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {mode !== 'create' && (
            <div className="flex items-center gap-1 text-xs font-bold text-[#5B57F0]">
              <Plus size={14} /> Create
            </div>
          )}
        </motion.div>

        {/* Join Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-2xl cursor-pointer bg-white border shadow-sm transition-all ${
            mode === 'join' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-[#EAE6DD]'
          }`}
          onClick={() => setMode(mode === 'join' ? 'idle' : 'join')}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-emerald-50 border border-emerald-200 text-emerald-600"
          >
            <LinkIcon size={24} />
          </div>
          <h3 className="font-bold mb-1 text-[#232019]">Join with Code</h3>
          <p className="text-sm mb-4 text-[#6E6A61]">
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
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-4 outline-none text-center tracking-widest font-bold uppercase bg-[#FAF8F5] border border-[#EAE6DD] text-[#232019] focus:border-emerald-500 focus:bg-white"
                  style={{
                    letterSpacing: '0.3em',
                  }}
                />

                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  <LinkIcon size={16} />
                  <span>{loading ? 'Joining...' : 'Join Party'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {mode !== 'join' && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
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
      toast.success('Quest shared with party!')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to share quest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl p-6 bg-white border border-[#EAE6DD] shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-[#5B57F0]" />
          <h3 className="font-bold text-lg text-[#232019]">
            Share a Quest
          </h3>
        </div>
        <p className="text-sm mb-4 text-[#6E6A61]">
          Shared quests appear in all members&apos; quest lists.
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelected(h.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all border cursor-pointer ${
                selected === h.id
                  ? 'bg-purple-50 border-[#5B57F0] text-[#5B57F0]'
                  : 'bg-[#FAF8F5] border-[#EAE6DD] text-[#232019] hover:bg-white'
              }`}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-[#EAE6DD] text-[#5B57F0]"
              >
                <DynamicIcon name={h.emoji} size={16} />
              </div>
              <span className="text-sm font-semibold">{h.name}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#6E6A61] bg-[#FAF8F5] border border-[#EAE6DD] hover:bg-[#EAE6DD]/50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selected || loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              selected && !loading
                ? 'bg-[#5B57F0] text-white shadow-sm cursor-pointer'
                : 'bg-[#EAE6DD] text-[#8A857A] cursor-not-allowed'
            }`}
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
          const p = profileMap[c.user_id] ?? { display_name: 'Unknown', avatar_emoji: 'swords' }
          const h = Array.isArray(c.habits) ? c.habits[0] : c.habits
          return {
            id: c.id,
            type: 'completion' as const,
            user_name: p.display_name,
            user_avatar: p.avatar_emoji,
            message: `completed ${h?.name ?? 'a quest'} +${h?.xp_reward ?? 0} XP`,
            xp: h?.xp_reward ?? 0,
            timestamp: c.completed_at,
            border_color: '#10B981',
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
            message: `completed ${habitData?.name ?? 'a quest'} +${habitData?.xp_reward ?? 0} XP`,
            xp: habitData?.xp_reward ?? 0,
            timestamp: completion.completed_at,
            border_color: '#10B981',
          }

          setActivity(prev => [newEvent, ...prev].slice(0, 20))
          toast.success(`${member.profile.display_name} completed a quest!`)
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
      toast.success('Reaction sent!')
    } catch {
      toast.success('Reaction sent to party member!')
    }
  }

  function copyInviteCode() {
    if (!party) return
    navigator.clipboard.writeText(party.invite_code)
    setCodeCopied(true)
    toast.success('Invite code copied!')
    setTimeout(() => setCodeCopied(false), 2000)
  }

  function sharePartyLink() {
    if (!party) return
    const url = `${window.location.origin}/party/join/${party.invite_code}`
    navigator.clipboard.writeText(`Join my party on Life RPG OS! Code: ${party.invite_code} → ${url}`)
    toast.success('Share link copied!')
  }

  const loading = profileLoading || partyLoading

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FBFAF7]">
        <Sidebar userAvatar={profile?.avatar_emoji ?? 'leaf'} userName={profile?.display_name ?? 'Adventurer'} userLevel={profile?.level ?? 1} />
        <main className="flex-1 p-6 pt-20" style={{ marginLeft: 240 }}>
          <div className="max-w-6xl mx-auto">
            <div className="h-8 rounded w-48 mb-2 animate-pulse bg-white border border-[#EAE6DD]" />
            <div className="h-4 rounded w-64 mb-8 animate-pulse bg-white border border-[#EAE6DD]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
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
        completedToday={completions_today.length}
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1 text-[#232019]">
              Party System
            </h1>
            <p className="text-sm text-[#6E6A61]">
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
                className="p-6 rounded-2xl relative overflow-hidden bg-white border border-[#EAE6DD] shadow-sm"
              >
                <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-purple-50 border border-purple-200 text-[#5B57F0] shadow-2xs"
                    >
                      <DynamicIcon name={party.emoji} size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-bold text-[#232019]">
                          {party.name}
                        </h2>
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#EDECFD] text-[#5B57F0] border border-[#D6D3FA]"
                        >
                          {PARTY_TYPE_LABELS[party.party_type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-[#6E6A61]">
                        <Users size={14} />
                        <span>{members.length} / {party.max_members} members</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:ml-auto flex-wrap">
                    {/* Invite Code */}
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD]"
                    >
                      <span className="text-xs text-[#8A857A]">Code</span>
                      <span
                        className="text-sm font-bold tracking-widest text-[#232019]"
                      >
                        {party.invite_code}
                      </span>
                      <button onClick={copyInviteCode} className="transition-all cursor-pointer text-[#8A857A] hover:text-[#5B57F0]">
                        {codeCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <button
                      onClick={sharePartyLink}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-[#5B57F0] text-white hover:bg-[#4F46E5] shadow-xs cursor-pointer"
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
                  { key: 'members', label: 'Members', icon: Swords },
                  { key: 'activity', label: 'Activity', icon: Scroll },
                  { key: 'quests', label: 'Shared Quests', icon: Users },
                ].map(({ key, label, icon: TabIcon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs border ${
                      activeTab === key
                        ? 'bg-[#5B57F0] text-white border-[#5B57F0]'
                        : 'bg-white text-[#6E6A61] border-[#EAE6DD] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <TabIcon size={15} />
                    <span>{label}</span>
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
                    className="p-6 rounded-2xl bg-white border border-[#EAE6DD] shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Flame size={18} className="text-rose-500" />
                      <h3 className="font-bold text-[#232019]">
                        Party Activity Feed
                      </h3>
                      <span
                        className="text-2xs px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-600 font-semibold border border-emerald-200"
                      >
                        <Zap size={11} /> Live
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
                    className="p-6 rounded-2xl bg-white border border-[#EAE6DD] shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" />
                        <h3 className="font-bold text-[#232019]">
                          Shared Quests
                        </h3>
                      </div>
                      {party.created_by === profile?.id && (
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-[#5B57F0] text-white hover:bg-[#4F46E5] shadow-xs cursor-pointer"
                        >
                          <Plus size={14} />
                          Share a Quest
                        </button>
                      )}
                    </div>

                    <div className="text-center py-8">
                      <div className="flex justify-center mb-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-50 border border-purple-200 text-[#5B57F0]"
                        >
                          <Target size={24} />
                        </div>
                      </div>
                      <p className="text-sm text-[#6E6A61] max-w-md mx-auto">
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
                className="p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-rose-50/70 to-amber-50/50 border border-rose-200 shadow-sm"
              >
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-rose-100 border border-rose-200 text-rose-600 shadow-xs"
                    >
                      <Skull size={32} />
                    </div>
                    <div>
                      <div
                        className="text-xs font-bold mb-1 flex items-center gap-1.5 text-rose-600 uppercase tracking-wider"
                      >
                        <Swords size={12} />
                        <span>PARTY BOSS</span>
                      </div>
                      <div className="text-lg font-bold text-[#232019]">
                        Procrastination Demon
                      </div>
                      <div className="text-sm mt-0.5 text-[#6E6A61]">
                        Defeat by completing all quests this week • Reward: 500 bonus XP each
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="flex justify-between text-xs mb-1 text-[#6E6A61]">
                      <span>Party Progress</span>
                      <span className="font-bold text-rose-600">
                        {members.reduce((a, m) => a + m.quests_done_today, 0)} / {members.reduce((a, m) => a + m.quests_total, 0)} quests
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden bg-white border border-rose-200">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500"
                        style={{
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
                  className="flex items-center justify-between p-5 rounded-2xl transition-all duration-200 cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 shadow-sm hover:border-pink-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-pink-100 border border-pink-200 text-pink-600 shadow-2xs"
                    >
                      <HeartHandshake size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-[#232019]">
                        Couple Mode
                      </div>
                      <div className="text-sm text-[#6E6A61]">
                        Link up with your partner for a shared dashboard & sync tracking
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-pink-600" />
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
