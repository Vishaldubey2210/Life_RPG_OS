'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Users, Package } from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'

interface PartyMember {
  name: string
  role: string
  avatar: string
  level: number
  streak: number
  questsDone: number
  questsTotal: number
}

const NPC_PARTY: PartyMember[] = [
  { name: 'Aiden Swift', role: 'Rogue (STR)', avatar: '🏹', level: 4, streak: 5, questsDone: 2, questsTotal: 3 },
  { name: 'Luna Vane', role: 'Mage (INT)', avatar: '🧙‍♀️', level: 6, streak: 8, questsDone: 3, questsTotal: 3 },
  { name: 'Kaelen Stout', role: 'Cleric (WIS)', avatar: '🛡️', level: 3, streak: 2, questsDone: 0, questsTotal: 2 },
]

export default function PartyPage() {
  const { profile, habits, completions_today, loading } = useProfile()

  const [bossHp, setBossHp] = useState(250)
  const [bossMaxHp] = useState(500)
  const [bossStatus, setBossStatus] = useState<'alive' | 'defeated'>('alive')
  const [showChestModal, setShowChestModal] = useState(false)
  const [damageDealt, setDamageDealt] = useState<number[]>([])

  // Calculate damage based on completed habits
  useEffect(() => {
    if (habits.length > 0) {
      const completedCount = completions_today.length
      // Base damage: NPC contributions + user contributions
      const npcDamage = 180 // Simulated NPC quest damage
      const userDamage = completedCount * 45 // 45 damage per completed quest
      const totalDmg = npcDamage + userDamage
      const remainingHp = Math.max(0, bossMaxHp - totalDmg)
      
      Promise.resolve().then(() => {
        setBossHp(remainingHp)
        if (remainingHp <= 0) {
          setBossStatus('defeated')
        }
      })
    }
  }, [completions_today, habits, bossMaxHp])

  function handleAttackBoss() {
    if (bossHp <= 0) return

    // Allow user to deal a manual swipe (simulating combat)
    const dmg = Math.floor(Math.random() * 20) + 15
    setDamageDealt((prev) => [...prev, dmg])
    setBossHp((prev) => {
      const nextHp = Math.max(0, prev - dmg)
      if (nextHp <= 0) {
        setBossStatus('defeated')
        toast.success('The Procrastination Demon has been slain! 🏆')
      }
      return nextHp
    })

    toast.success(`Strike! Dealt ${dmg} damage to the Boss! ⚔️`)

    // Clear damage number after animation
    setTimeout(() => {
      setDamageDealt((prev) => prev.slice(1))
    }, 1000)
  }

  function handleClaimLoot() {
    setShowChestModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">👥</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Gathering Party Members...
          </div>
        </div>
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

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240 }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
              Guild & Party 👥
            </h1>
            <p style={{ color: '#9B99B8' }}>
              Team up with your companions, share your accomplishments, and take down daily epic bosses.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Boss Battle Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div
                className="p-6 rounded-2xl relative overflow-hidden border"
                style={{
                  background: 'linear-gradient(180deg, #13131F, #0F0F1A)',
                  borderColor: bossStatus === 'defeated' ? '#22C55E44' : '#EF444444',
                }}
              >
                {/* Glow behind boss */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: bossStatus === 'defeated' ? '#22C55E' : '#EF4444' }}
                />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#EF444422', color: '#EF4444' }}>
                    <Swords size={12} /> Daily Raid Boss Event
                  </div>

                  {/* Boss Art representation */}
                  <motion.div
                    animate={bossStatus === 'alive' ? { y: [0, -10, 0] } : { rotate: 90, opacity: 0.5 }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="text-8xl my-6 select-none cursor-pointer filter drop-shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    onClick={handleAttackBoss}
                  >
                    {bossStatus === 'alive' ? '😈' : '💀'}
                  </motion.div>

                  <h2 className="text-2xl font-bold font-display mb-1" style={{ color: '#F1F0FF' }}>
                    {bossStatus === 'alive' ? 'The Procrastination Demon' : 'Shattered Demon Core'}
                  </h2>
                  <p className="text-xs mb-4 max-w-sm" style={{ color: '#9B99B8' }}>
                    {bossStatus === 'alive' 
                      ? 'Deals damage to the Guild if party members leave quests incomplete by midnight.' 
                      : 'The demon is vanquished! Claim your party loot.'}
                  </p>

                  {/* HP Bar */}
                  <div className="w-full max-w-md mb-6">
                    <div className="flex justify-between text-xs mb-1.5 font-semibold font-display">
                      <span style={{ color: '#9B99B8' }}>💥 BOSS HP</span>
                      <span style={{ color: bossHp > 100 ? '#EF4444' : '#22C55E' }}>
                        {bossHp} / {bossMaxHp} HP
                      </span>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden p-0.5" style={{ background: '#1E1E35' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, #EF4444, #EC4899)',
                          width: `${(bossHp / bossMaxHp) * 100}%`,
                        }}
                        animate={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Combat buttons */}
                  {bossStatus === 'alive' ? (
                    <button
                      onClick={handleAttackBoss}
                      className="px-8 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 group"
                      style={{
                        background: '#EF4444',
                        color: '#F1F0FF',
                        fontFamily: 'Oxanium, sans-serif',
                        boxShadow: '0 0 15px #EF444444',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#DC2626')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#EF4444')}
                    >
                      <Swords size={18} className="group-hover:rotate-12 transition-transform" />
                      Strike Target
                    </button>
                  ) : (
                    <button
                      onClick={handleClaimLoot}
                      className="px-8 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2"
                      style={{
                        background: '#22C55E',
                        color: '#08080F',
                        fontFamily: 'Oxanium, sans-serif',
                        boxShadow: '0 0 15px #22C55E44',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#16A34A')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#22C55E')}
                    >
                      <Package size={18} />
                      Claim Boss Chest
                    </button>
                  )}

                  {/* Floating Combat text */}
                  <AnimatePresence>
                    {damageDealt.map((dmg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 1, y: -40, scale: 1.5 }}
                        animate={{ opacity: 0, y: -120, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute text-2xl font-extrabold font-display pointer-events-none"
                        style={{ color: '#EF4444', textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                      >
                        -{dmg} HP
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right side: Guild Members */}
            <div className="space-y-6">
              <div
                className="p-6 rounded-2xl"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: '#1E1E35' }}>
                  <div className="flex items-center gap-2">
                    <Users size={18} style={{ color: '#9F67FF' }} />
                    <span className="font-semibold font-display" style={{ color: '#F1F0FF' }}>Party Roster</span>
                  </div>
                  <span className="text-xs" style={{ color: '#5C5A7A' }}>4 Active</span>
                </div>

                <div className="space-y-4">
                  {/* Your Character */}
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <div className="text-3xl">{profile?.avatar_emoji ?? '⚔️'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center gap-1.5" style={{ color: '#F1F0FF' }}>
                        {profile?.display_name ?? 'Adventurer'}
                        <span className="text-xxs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">You</span>
                      </div>
                      <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: '#9B99B8' }}>
                        <span>Level {profile?.level ?? 1}</span>
                        <span>•</span>
                        <span style={{ color: '#22C55E' }}>
                          {completions_today.length}/{habits.length} Quests
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-bold font-display" style={{ color: '#F59E0B' }}>
                      🔥 {profile?.streak ?? 0}
                    </div>
                  </div>

                  {/* NPC Companions */}
                  {NPC_PARTY.map((mem) => (
                    <div key={mem.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/10 transition-colors">
                      <div className="text-3xl">{mem.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate" style={{ color: '#F1F0FF' }}>
                          {mem.name}
                        </div>
                        <div className="text-xs flex items-center gap-2 mt-0.5" style={{ color: '#9B99B8' }}>
                          <span>Level {mem.level} {mem.role}</span>
                          <span>•</span>
                          <span style={{ color: '#22C55E' }}>
                            {mem.questsDone}/{mem.questsTotal} Quests
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-bold font-display" style={{ color: '#F59E0B' }}>
                        🔥 {mem.streak}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Loot Chest Modal */}
      <AnimatePresence>
        {showChestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm text-center rounded-2xl p-8 border"
              style={{ background: '#13131F', borderColor: '#22C55E44' }}
            >
              <div className="text-6xl mb-4 animate-bounce">🎁</div>
              <h3 className="text-2xl font-bold font-display mb-2" style={{ color: '#F1F0FF' }}>
                Boss Chest Unlocked!
              </h3>
              <p className="text-sm mb-6" style={{ color: '#9B99B8' }}>
                For defeating the Procrastination Demon, your party receives rewards!
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-black/30 border border-slate-800">
                  <div className="text-lg">💰</div>
                  <div className="font-bold text-sm text-amber-500 mt-1">+20 Gold</div>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-slate-800">
                  <div className="text-lg">⚡</div>
                  <div className="font-bold text-sm text-violet-400 mt-1">+50 Guild XP</div>
                </div>
              </div>

              <button
                onClick={() => setShowChestModal(false)}
                className="w-full py-3 rounded-xl font-bold text-sm transition-colors"
                style={{ background: '#22C55E', color: '#08080F' }}
              >
                Add to Inventory
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
