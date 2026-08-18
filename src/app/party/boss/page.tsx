'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Skull, Shield, Swords, Zap, Users, Plus, X, Crown,
  Trophy, ChevronRight, Loader2, AlertTriangle, Flame
} from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

interface BossBattle {
  id: string
  name: string
  description: string
  emoji: string
  difficulty: 'normal' | 'hard' | 'legendary'
  target_completions: number
  current_completions: number
  bonus_xp_per_member: number
  start_date: string
  end_date: string
  status: 'active' | 'won' | 'lost' | 'cancelled'
  party_id: string
  created_by: string
}

interface BossContribution {
  user_id: string
  completions_count: number
  profiles?: { display_name: string; avatar_url?: string }
}

const BOSS_EMOJIS = ['👹', '🐉', '💀', '👾', '🔮', '☠️', '🦂', '🌋']

const DIFFICULTY_CONFIG = {
  normal:    { label: 'Normal',    color: '#22C55E', xp: 500,  target: 50,  days: 7  },
  hard:      { label: 'Hard',      color: '#F59E0B', xp: 750,  target: 100, days: 14 },
  legendary: { label: 'Legendary', color: '#EF4444', xp: 1000, target: 200, days: 30 },
}

export default function BossPage() {
  const { profile } = useProfile()
  const [activeBoss, setActiveBoss] = useState<BossBattle | null>(null)
  const [contributions, setContributions] = useState<BossContribution[]>([])
  const [partyId, setPartyId] = useState<string | null>(null)
  const [isLeader, setIsLeader] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Create form state
  const [bossName, setBossName] = useState('')
  const [bossEmoji, setBossEmoji] = useState('👹')
  const [bossDesc, setBossDesc] = useState('')
  const [difficulty, setDifficulty] = useState<'normal' | 'hard' | 'legendary'>('hard')
  const [creating, setCreating] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      if (!profile?.id) return
      setLoading(true)
      try {
        // Get user's party
        const { data: member } = await supabase
          .from('party_members')
          .select('party_id, role')
          .eq('user_id', profile.id)
          .maybeSingle()

        if (!member) return

        setPartyId(member.party_id)
        setIsLeader(member.role === 'leader')

        // Get active boss battle
        const { data: boss } = await supabase
          .from('boss_battles')
          .select('*')
          .eq('party_id', member.party_id)
          .eq('status', 'active')
          .maybeSingle()

        if (boss) {
          setActiveBoss(boss as BossBattle)

          // Load contributions
          const { data: contribs } = await supabase
            .from('boss_contributions')
            .select('user_id, completions_count, profiles:user_id(display_name, avatar_url)')
            .eq('boss_id', boss.id)
            .order('completions_count', { ascending: false })

          setContributions(contribs as unknown as BossContribution[])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.id, supabase])

  async function handleCreateBoss() {
    if (!partyId || !profile?.id || !bossName.trim()) return
    setCreating(true)
    try {
      const diff = DIFFICULTY_CONFIG[difficulty]
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + diff.days)

      const { data, error } = await supabase
        .from('boss_battles')
        .insert({
          party_id: partyId,
          name: bossName.trim(),
          description: bossDesc.trim(),
          emoji: bossEmoji,
          difficulty,
          target_completions: diff.target,
          bonus_xp_per_member: diff.xp,
          end_date: endDate.toISOString().split('T')[0],
          created_by: profile.id,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      setActiveBoss(data as BossBattle)
      setShowCreateForm(false)
      toast.success(`Boss Battle "${bossName}" has been summoned! ⚔️`)
    } catch (err) {
      console.error('Create boss error:', err)
      toast.error('Failed to summon boss battle')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#08080F]">
        <Sidebar />
        <div className="flex-1 md:ml-60 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  const bossHPPct = activeBoss
    ? Math.max(0, ((activeBoss.target_completions - activeBoss.current_completions) / activeBoss.target_completions) * 100)
    : 100

  const daysRemaining = activeBoss
    ? Math.max(0, Math.ceil((new Date(activeBoss.end_date).getTime() - Date.now()) / 86400000))
    : 0

  return (
    <div className="flex min-h-screen bg-[#08080F]">
      <Sidebar />
      <main className="flex-1 md:ml-60 p-4 md:p-8 max-w-4xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 font-display mb-1.5">
              <Skull size={14} />
              <span>Party Boss Battle</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display">
              Guild Raid
            </h1>
          </div>
          {isLeader && !activeBoss && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 flex items-center gap-2 font-display shadow-lg shadow-red-900/40"
            >
              <Plus size={16} /> Summon Boss
            </button>
          )}
        </div>

        {!partyId ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-[#13131F]">
            <Users size={36} className="mx-auto text-slate-500 mb-3" />
            <h3 className="text-lg font-bold text-white font-display mb-2">No Party Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Join or create a party first to start boss battles together.
            </p>
          </div>
        ) : !activeBoss ? (
          <div className="p-12 text-center rounded-2xl border border-red-500/20 bg-[#13131F]">
            <div className="text-6xl mb-4 grayscale opacity-40">👹</div>
            <h3 className="text-lg font-bold text-white font-display mb-2">No Active Raid</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {isLeader
                ? 'Summon a boss for your party to conquer together. Defeat it for massive XP rewards.'
                : 'Your party leader has not started a boss battle yet.'}
            </p>
            {isLeader && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 font-display"
              >
                Summon Boss Battle ⚔️
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Boss Status Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(8,8,15,0.95))',
                borderColor: '#EF444466',
                boxShadow: '0 0 40px rgba(239,68,68,0.15)',
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 bg-red-500 pointer-events-none" />

              <div className="flex items-start gap-5 mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{ background: '#EF444420', border: '2px solid #EF444450', filter: 'drop-shadow(0 0 10px #EF4444)' }}
                >
                  {activeBoss.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-display">
                      ⚔️ ACTIVE RAID
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${DIFFICULTY_CONFIG[activeBoss.difficulty].color}20`,
                        color: DIFFICULTY_CONFIG[activeBoss.difficulty].color,
                        border: `1px solid ${DIFFICULTY_CONFIG[activeBoss.difficulty].color}50`,
                      }}
                    >
                      {DIFFICULTY_CONFIG[activeBoss.difficulty].label}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white font-display">{activeBoss.name}</h2>
                  {activeBoss.description && (
                    <p className="text-xs text-slate-400 mt-1">{activeBoss.description}</p>
                  )}
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="text-2xl font-black text-amber-400 font-display">{daysRemaining}</div>
                  <div className="text-[10px] text-slate-400">days left</div>
                </div>
              </div>

              {/* Boss HP Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-red-400 font-bold font-display">BOSS HP</span>
                  <span className="text-red-400 font-bold font-display">
                    {activeBoss.target_completions - activeBoss.current_completions} / {activeBoss.target_completions}
                  </span>
                </div>
                <div className="h-4 rounded-full overflow-hidden bg-slate-900 border border-red-500/20">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${bossHPPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                      background: bossHPPct > 60
                        ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                        : bossHPPct > 30
                        ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                        : 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                      boxShadow: '0 0 12px rgba(239,68,68,0.5)',
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {activeBoss.current_completions} quest completions dealt — {Math.round(100 - bossHPPct)}% damage done
                </p>
              </div>

              {/* Bonus XP */}
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Trophy size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400 font-display">
                  Victory Reward: +{activeBoss.bonus_xp_per_member} XP per party member
                </span>
              </div>
            </motion.div>

            {/* Party Contributions */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#13131F]">
              <h3 className="text-sm font-bold text-white font-display mb-4 flex items-center gap-2">
                <Users size={16} className="text-purple-400" /> Party Contributions
              </h3>
              {contributions.length === 0 ? (
                <p className="text-xs text-slate-400">No contributions yet. Complete your daily quests to deal damage!</p>
              ) : (
                <div className="space-y-3">
                  {contributions.map((contrib, idx) => {
                    const name = contrib.profiles?.display_name ?? 'Adventurer'
                    return (
                      <div key={contrib.user_id} className="flex items-center gap-3">
                        <div className="w-5 h-5 text-center text-xs font-bold text-slate-400">
                          {idx === 0 ? <Crown size={16} className="text-amber-400" /> : `#${idx + 1}`}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center font-bold font-display">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-white">{name}</div>
                          <div className="text-[11px] text-slate-400">{contrib.completions_count} damage dealt</div>
                        </div>
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1 font-display">
                          <Swords size={12} /> {contrib.completions_count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Boss Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#13131F] p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    <Skull size={18} className="text-red-400" /> Summon Boss Battle
                  </h3>
                  <button onClick={() => setShowCreateForm(false)} className="p-1 text-slate-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Boss Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Boss Name *</label>
                    <input
                      type="text"
                      value={bossName}
                      onChange={(e) => setBossName(e.target.value)}
                      placeholder="e.g. Exam Week Destroyer"
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0F0F1A] border border-slate-800 text-white outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Boss Emoji */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Boss Avatar</label>
                    <div className="flex gap-2 flex-wrap">
                      {BOSS_EMOJIS.map((em) => (
                        <button
                          key={em}
                          onClick={() => setBossEmoji(em)}
                          className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                            bossEmoji === em ? 'border-2 border-red-500 bg-red-500/15 scale-110' : 'border border-slate-800 bg-slate-900 opacity-70'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.entries(DIFFICULTY_CONFIG) as [string, typeof DIFFICULTY_CONFIG['normal']][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setDifficulty(key as 'normal' | 'hard' | 'legendary')}
                          className="py-2.5 rounded-xl text-xs font-bold text-center transition-all"
                          style={{
                            background: difficulty === key ? `${cfg.color}20` : '#0F0F1A',
                            border: `1px solid ${difficulty === key ? cfg.color : '#1E1E35'}`,
                            color: difficulty === key ? cfg.color : '#9B99B8',
                          }}
                        >
                          <div>{cfg.label}</div>
                          <div className="text-[10px] opacity-80">{cfg.target} quests</div>
                          <div className="text-[10px] opacity-80">+{cfg.xp} XP</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Description (optional)</label>
                    <textarea
                      value={bossDesc}
                      onChange={(e) => setBossDesc(e.target.value)}
                      placeholder="What challenge will your party overcome?"
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0F0F1A] border border-slate-800 text-white outline-none resize-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateBoss}
                      disabled={creating || !bossName.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 font-display disabled:opacity-60"
                    >
                      {creating ? <Loader2 size={15} className="animate-spin" /> : <Skull size={15} />}
                      Summon
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
