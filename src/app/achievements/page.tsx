'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, Star, Coins } from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

interface Achievement {
  id: string
  title: string
  description: string
  criteria: string
  reward: number
  icon: string
  category: 'level' | 'streak' | 'stats'
  check: (params: { level: number; streak: number; totalStats: number }) => boolean
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Began the journey of self-mastery.',
    criteria: 'Reach Level 2',
    reward: 10,
    icon: '🚶',
    category: 'level',
    check: ({ level }) => level >= 2,
  },
  {
    id: 'elite_warrior',
    title: 'Elite Warrior',
    description: 'Forged in the fire of consistent habits.',
    criteria: 'Reach Level 5',
    reward: 35,
    icon: '⚔️',
    category: 'level',
    check: ({ level }) => level >= 5,
  },
  {
    id: 'streak_spark',
    title: 'Fire Starter',
    description: 'Maintained a habit streak for 3 consecutive days.',
    criteria: '3-Day Streak',
    reward: 15,
    icon: '🔥',
    category: 'streak',
    check: ({ streak }) => streak >= 3,
  },
  {
    id: 'streak_blaze',
    title: 'Undefeated',
    description: 'Maintained a habit streak for 7 consecutive days.',
    criteria: '7-Day Streak',
    reward: 40,
    icon: '☄️',
    category: 'streak',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'stat_novice',
    title: 'Base Growth',
    description: 'Accumulate overall attribute points.',
    criteria: '15 Base Stat Points',
    reward: 20,
    icon: '📈',
    category: 'stats',
    check: ({ totalStats }) => totalStats >= 15,
  },
  {
    id: 'stat_expert',
    title: 'Maximized Build',
    description: 'Build a well-rounded set of base stats.',
    criteria: '30 Base Stat Points',
    reward: 50,
    icon: '👑',
    category: 'stats',
    check: ({ totalStats }) => totalStats >= 30,
  },
]

export default function AchievementsPage() {
  const { profile, stats, loading, refetch } = useProfile()
  const supabase = createClient()

  const [claimed, setClaimed] = useState<string[]>([])
  const [claimingId, setClaimingId] = useState<string | null>(null)

  // Load claimed achievement rewards from local storage mapped by user id
  useEffect(() => {
    if (profile?.id) {
      const saved = localStorage.getItem(`life_rpg_claimed_achievements_${profile.id}`)
      if (saved) {
        Promise.resolve().then(() => {
          setClaimed(JSON.parse(saved) as string[])
        })
      }
    }
  }, [profile?.id])

  const totalStats =
    (stats?.str ?? 0) +
    (stats?.int ?? 0) +
    (stats?.wis ?? 0) +
    (stats?.vit ?? 0) +
    (stats?.cha ?? 0)

  async function handleClaim(ach: Achievement) {
    if (!profile || !stats || claimingId) return

    setClaimingId(ach.id)
    try {
      // Add gold to stats
      const newGold = stats.gold + ach.reward
      const { error } = await supabase
        .from('stats')
        .update({ gold: newGold })
        .eq('user_id', profile.id)

      if (error) throw error

      // Update claimed list
      const nextClaimed = [...claimed, ach.id]
      localStorage.setItem(`life_rpg_claimed_achievements_${profile.id}`, JSON.stringify(nextClaimed))
      setClaimed(nextClaimed)

      toast.success(`Claimed 💰 ${ach.reward} Gold for "${ach.title}"!`)
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Claim failed')
    } finally {
      setClaimingId(null)
    }
  }

  const checkData = {
    level: profile?.level ?? 1,
    streak: profile?.streak ?? 0,
    totalStats,
  }

  const unlockedCount = ACHIEVEMENTS.filter((ach) => ach.check(checkData)).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏆</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Unlocking Hall of Trophies...
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b" style={{ borderColor: '#1E1E35' }}>
            <div>
              <h1 className="text-3xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
                Achievements 🏆
              </h1>
              <p style={{ color: '#9B99B8' }}>
                Complete milestones to unlock rare badges and earn bonus Gold rewards.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-display" style={{ color: '#F59E0B' }}>
                {unlockedCount} / {ACHIEVEMENTS.length}
              </div>
              <span className="text-xs" style={{ color: '#5C5A7A' }}>Badges Unlocked</span>
            </div>
          </div>

          {/* Grid list of badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = ach.check(checkData)
              const isClaimed = claimed.includes(ach.id)

              return (
                <motion.div
                  key={ach.id}
                  className="p-5 rounded-2xl flex items-start gap-4 border relative overflow-hidden transition-all duration-300"
                  style={{
                    background: isUnlocked
                      ? 'linear-gradient(135deg, #13131F, #F59E0B0a)'
                      : '#13131F',
                    borderColor: isUnlocked
                      ? isClaimed
                        ? '#7C3AED44'
                        : '#F59E0B88'
                      : '#1E1E35',
                    boxShadow: isUnlocked && !isClaimed ? '0 0 20px #F59E0B11' : 'none',
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Badge Icon */}
                  <div
                    className="text-4xl p-3.5 rounded-2xl flex-shrink-0 flex items-center justify-center relative select-none"
                    style={{
                      background: isUnlocked ? '#F59E0B11' : '#0F0F1A',
                      filter: isUnlocked ? 'none' : 'grayscale(1)',
                    }}
                  >
                    {ach.icon}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                        <Lock size={16} style={{ color: '#5C5A7A' }} />
                      </div>
                    )}
                  </div>

                  {/* Badge Description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate mb-1 font-display flex items-center gap-1.5" style={{ color: '#F1F0FF' }}>
                      {ach.title}
                      {isUnlocked && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </h3>
                    <p className="text-xs mb-3" style={{ color: '#9B99B8' }}>
                      {ach.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <span className="text-xxs px-2 py-0.5 rounded-full" style={{ background: '#0F0F1A', color: '#5C5A7A', border: '1px solid #1E1E35' }}>
                        {ach.criteria}
                      </span>
                      <span className="text-xxs font-semibold flex items-center gap-1 font-display" style={{ color: '#F59E0B' }}>
                        <Coins size={10} /> +{ach.reward} Gold
                      </span>
                    </div>
                  </div>

                  {/* Claim action */}
                  {isUnlocked && (
                    <div className="flex-shrink-0 flex items-center self-center">
                      {isClaimed ? (
                        <span className="text-xxs uppercase tracking-wider font-semibold" style={{ color: '#5C5A7A' }}>
                          Claimed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(ach)}
                          disabled={claimingId !== null}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1"
                          style={{
                            background: '#F59E0B',
                            color: '#08080F',
                            fontFamily: 'Oxanium, sans-serif',
                            boxShadow: '0 0 10px #F59E0B44',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#D97706')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#F59E0B')}
                        >
                          <Star size={12} />
                          Claim
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
