'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Skull, Swords, Users, Plus, X, Crown,
  Trophy, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import DynamicIcon from '@/components/ui/DynamicIcon'
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

const BOSS_EMOJIS = ['skull', 'dragon', 'ghost', 'ban', 'flame', 'swords', 'shield_alert', 'zap']

const DIFFICULTY_CONFIG = {
  normal:    { label: 'Normal',    color: '#10B981', xp: 500,  target: 50,  days: 7  },
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
  const [bossEmoji, setBossEmoji] = useState('skull')
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
      toast.success(`Boss Battle "${bossName}" has been summoned!`)
    } catch (err) {
      console.error('Create boss error:', err)
      toast.error('Failed to summon boss battle')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FBFAF7]">
        <Sidebar userAvatar={profile?.avatar_emoji ?? 'leaf'} userName={profile?.display_name ?? 'Adventurer'} userLevel={profile?.level ?? 1} />
        <div className="flex-1 md:ml-60 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#5B57F0]" />
        </div>
      </div>
    )
  }

  const daysRemaining = activeBoss ? Math.max(0, Math.ceil((new Date(activeBoss.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
  const bossHPPct = activeBoss ? Math.max(0, Math.round(((activeBoss.target_completions - activeBoss.current_completions) / activeBoss.target_completions) * 100)) : 100

  return (
    <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]">
      <Sidebar userAvatar={profile?.avatar_emoji ?? 'leaf'} userName={profile?.display_name ?? 'Adventurer'} userLevel={profile?.level ?? 1} />
      <main className="flex-1 md:ml-60 p-4 md:p-8 max-w-4xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1.5">
              <Skull size={14} />
              <span>Co-op Raid</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#232019]">Party Boss Battles</h1>
            <p className="text-[#6E6A61] text-sm mt-1">Defeat massive bosses together as a party by completing habits.</p>
          </div>
          {isLeader && !activeBoss && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus size={16} /> Summon Boss
            </button>
          )}
        </div>

        {!partyId ? (
          <div className="p-12 text-center rounded-2xl border border-[#EAE6DD] bg-white shadow-sm">
            <Users size={36} className="mx-auto text-[#8A857A] mb-3" />
            <h3 className="text-lg font-bold text-[#232019] mb-2">No Party Found</h3>
            <p className="text-xs text-[#6E6A61] max-w-xs mx-auto">
              Join or create a party first to start boss battles together.
            </p>
          </div>
        ) : !activeBoss ? (
          <div className="p-12 text-center rounded-2xl border border-rose-200 bg-rose-50/50 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-rose-100 border border-rose-200 text-rose-600">
                <Skull size={36} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#232019] mb-2">No Active Raid</h3>
            <p className="text-xs text-[#6E6A61] max-w-sm mx-auto mb-6">
              {isLeader
                ? 'Summon a boss for your party to conquer together. Defeat it for massive XP rewards.'
                : 'Your party leader has not started a boss battle yet.'}
            </p>
            {isLeader && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center justify-center gap-2 mx-auto shadow-sm cursor-pointer"
              >
                <Swords size={16} />
                <span>Summon Boss Battle</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Boss Status Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-rose-200 bg-white shadow-md overflow-hidden relative"
            >
              <div className="flex items-start gap-5 mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-rose-600 bg-rose-50 border border-rose-200 shadow-sm"
                >
                  <DynamicIcon name={activeBoss.emoji} size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                      <Swords size={13} />
                      <span>ACTIVE RAID</span>
                    </span>
                    <span
                      className="text-2xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: `${DIFFICULTY_CONFIG[activeBoss.difficulty].color}15`,
                        color: DIFFICULTY_CONFIG[activeBoss.difficulty].color,
                        border: `1px solid ${DIFFICULTY_CONFIG[activeBoss.difficulty].color}44`,
                      }}
                    >
                      {DIFFICULTY_CONFIG[activeBoss.difficulty].label}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#232019]">{activeBoss.name}</h2>
                  {activeBoss.description && (
                    <p className="text-xs text-[#6E6A61] mt-1">{activeBoss.description}</p>
                  )}
                </div>         
                <div className="text-center flex-shrink-0">
                  <div className="text-2xl font-black text-amber-600">{daysRemaining}</div>
                  <div className="text-2xs text-[#8A857A]">days left</div>
                </div>
              </div>

              {/* Boss HP Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-rose-600 font-bold">BOSS HP</span>
                  <span className="text-rose-600 font-bold">
                    {activeBoss.target_completions - activeBoss.current_completions} / {activeBoss.target_completions}
                  </span>
                </div>
                <div className="h-4 rounded-full overflow-hidden bg-[#FAF8F5] border border-rose-200">
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
                        : 'linear-gradient(90deg, #10B981, #059669)',
                    }}
                  />
                </div>
                <p className="text-xs text-[#8A857A] mt-1">
                  {activeBoss.current_completions} quest completions dealt — {Math.round(100 - bossHPPct)}% damage done
                </p>
              </div>

              {/* Bonus XP */}
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                <Trophy size={14} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-700">
                  Victory Reward: +{activeBoss.bonus_xp_per_member} XP per party member
                </span>
              </div>
            </motion.div>

            {/* Party Contributions */}
            <div className="p-5 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm">
              <h3 className="text-sm font-bold text-[#232019] mb-4 flex items-center gap-2">
                <Users size={16} className="text-[#5B57F0]" /> Party Contributions
              </h3>
              {contributions.length === 0 ? (
                <p className="text-xs text-[#8A857A]">No contributions yet. Complete your daily quests to deal damage!</p>
              ) : (
                <div className="space-y-3">
                  {contributions.map((contrib, idx) => {
                    const name = contrib.profiles?.display_name ?? 'Adventurer'
                    return (
                      <div key={contrib.user_id} className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD]">
                        <div className="w-5 h-5 text-center text-xs font-bold text-[#8A857A]">
                          {idx === 0 ? <Crown size={16} className="text-amber-500" /> : `#${idx + 1}`}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#5B57F0] text-sm flex items-center justify-center font-bold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-[#232019]">{name}</div>
                          <div className="text-2xs text-[#6E6A61]">{contrib.completions_count} damage dealt</div>
                        </div>
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md rounded-3xl border border-[#EAE6DD] bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE6DD]">
                  <h3 className="text-lg font-bold text-[#232019] flex items-center gap-2">
                    <Skull size={18} className="text-rose-600" /> Summon Boss Battle
                  </h3>
                  <button onClick={() => setShowCreateForm(false)} className="p-1 text-[#8A857A] hover:text-[#232019] cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Boss Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#232019] mb-1">Boss Name *</label>
                    <input
                      type="text"
                      value={bossName}
                      onChange={(e) => setBossName(e.target.value)}
                      placeholder="e.g. Exam Week Destroyer"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAF8F5] border border-[#EAE6DD] text-[#232019] outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>

                  {/* Boss Emoji */}
                  <div>
                    <label className="block text-xs font-bold text-[#232019] mb-2">Boss Avatar</label>
                    <div className="flex gap-2 flex-wrap">
                      {BOSS_EMOJIS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setBossEmoji(em)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            bossEmoji === em ? 'border-2 border-rose-500 bg-rose-50 scale-105 text-rose-600 shadow-sm' : 'border border-[#EAE6DD] bg-[#FAF8F5] text-[#8A857A] hover:text-[#232019]'
                          }`}
                        >
                          <DynamicIcon name={em} size={20} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-bold text-[#232019] mb-2">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.entries(DIFFICULTY_CONFIG) as [string, typeof DIFFICULTY_CONFIG['normal']][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setDifficulty(key as 'normal' | 'hard' | 'legendary')}
                          className="py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer shadow-2xs"
                          style={{
                            background: difficulty === key ? `${cfg.color}15` : '#FAF8F5',
                            border: `1.5px solid ${difficulty === key ? cfg.color : '#EAE6DD'}`,
                            color: difficulty === key ? cfg.color : '#6E6A61',
                          }}
                        >
                          <div>{cfg.label}</div>
                          <div className="text-2xs opacity-80 font-normal">{cfg.target} quests</div>
                          <div className="text-2xs opacity-80 font-normal">+{cfg.xp} XP</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#232019] mb-1">Description (optional)</label>
                    <textarea
                      value={bossDesc}
                      onChange={(e) => setBossDesc(e.target.value)}
                      placeholder="What challenge will your party overcome?"
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#FAF8F5] border border-[#EAE6DD] text-[#232019] outline-none resize-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#FAF8F5] border border-[#EAE6DD] text-[#6E6A61] hover:bg-[#EAE6DD]/50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateBoss}
                      disabled={creating || !bossName.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm cursor-pointer"
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
