'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, Coins, Lock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

interface SkillNode {
  id: string
  name: string
  description: string
  branch: 'str' | 'int' | 'wis' | 'vit' | 'cha'
  statReq: number
  goldCost: number
  emoji: string
  unlocked: boolean
  dependencies?: string[]
}

const DEFAULT_SKILLS: SkillNode[] = [
  // STR Branch
  { id: 'iron_lung', name: 'Iron Lungs', description: 'Improves stamina and cardiovascular recovery.', branch: 'str', statReq: 3, goldCost: 5, emoji: '🫁', unlocked: false },
  { id: 'heavy_lift', name: 'Titan Grip', description: 'Unlocks heavy weight training abilities.', branch: 'str', statReq: 8, goldCost: 15, emoji: '🏋️', unlocked: false, dependencies: ['iron_lung'] },
  { id: 'indestructible', name: 'Indestructible', description: 'Maximize physical durability and stamina.', branch: 'str', statReq: 15, goldCost: 35, emoji: '🛡️', unlocked: false, dependencies: ['heavy_lift'] },

  // INT Branch
  { id: 'focus_mind', name: 'Deep Work Focus', description: 'Maintains concentration for extended blocks.', branch: 'int', statReq: 4, goldCost: 5, emoji: '🔬', unlocked: false },
  { id: 'polymath', name: 'Polymath Core', description: 'Accelerates rate of learning new disciplines.', branch: 'int', statReq: 10, goldCost: 20, emoji: '📚', unlocked: false, dependencies: ['focus_mind'] },
  { id: 'archmage', name: 'Master Architect', description: 'Design complex solutions and codebases effortlessly.', branch: 'int', statReq: 18, goldCost: 45, emoji: '🔮', unlocked: false, dependencies: ['polymath'] },

  // WIS Branch
  { id: 'inner_calm', name: 'Zen Mind', description: 'Maintains equanimity during stressful situations.', branch: 'wis', statReq: 3, goldCost: 5, emoji: '🧘', unlocked: false },
  { id: 'stoic', name: 'Stoic Fortress', description: 'Shields against emotional impulse or distraction.', branch: 'wis', statReq: 8, goldCost: 15, emoji: '🏛️', unlocked: false, dependencies: ['inner_calm'] },
  { id: 'transcendence', name: 'Self-Actualized', description: 'Unlocks absolute clarity and life alignment.', branch: 'wis', statReq: 15, goldCost: 40, emoji: '👁️', unlocked: false, dependencies: ['stoic'] },

  // VIT Branch
  { id: 'hydration', name: 'Water Golem', description: 'Gain extreme vitality through consistent hydration.', branch: 'vit', statReq: 2, goldCost: 3, emoji: '💧', unlocked: false },
  { id: 'deep_sleep', name: 'Rejuvenator', description: 'Amplifies physical recovery from high quality sleep.', branch: 'vit', statReq: 6, goldCost: 12, emoji: '😴', unlocked: false, dependencies: ['hydration'] },

  // CHA Branch
  { id: 'orator', name: 'Silver Tongue', description: 'Improves presentation skills and public speaking.', branch: 'cha', statReq: 3, goldCost: 5, emoji: '🗣️', unlocked: false },
  { id: 'networker', name: 'Guild Recruiter', description: 'Easily connect with like-minded builders.', branch: 'cha', statReq: 9, goldCost: 18, emoji: '🤝', unlocked: false, dependencies: ['orator'] },
]

export default function SkillsPage() {
  const { profile, stats, loading, refetch } = useProfile()
  const supabase = createClient()

  const [skills, setSkills] = useState<SkillNode[]>(DEFAULT_SKILLS)
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'str' | 'int' | 'wis' | 'vit' | 'cha'>('all')
  const [activeSkill, setActiveSkill] = useState<SkillNode | null>(null)
  const [buying, setBuying] = useState(false)

  // Load unlocked skills from localStorage mapping them to user id
  useEffect(() => {
    if (profile?.id) {
      const saved = localStorage.getItem(`life_rpg_unlocked_${profile.id}`)
      if (saved) {
        const unlockedIds = JSON.parse(saved) as string[]
        Promise.resolve().then(() => {
          setSkills((prev) =>
            prev.map((s) => ({
              ...s,
              unlocked: unlockedIds.includes(s.id),
            }))
          )
        })
      }
    }
  }, [profile?.id])

  async function handleUnlock(skill: SkillNode) {
    if (!profile || !stats) return
    if (skill.unlocked) return

    // Verify stat requirements
    const userStatVal = (stats as unknown as Record<string, number>)[skill.branch] ?? 0
    if (userStatVal < skill.statReq) {
      toast.error(`Requires ${skill.branch.toUpperCase()} level ${skill.statReq}!`)
      return
    }

    // Verify gold
    if (stats.gold < skill.goldCost) {
      toast.error('Insufficient Gold!')
      return
    }

    // Check dependencies
    if (skill.dependencies) {
      const unresolved = skill.dependencies.filter(
        (depId) => !skills.find((s) => s.id === depId)?.unlocked
      )
      if (unresolved.length > 0) {
        toast.error('Prior skill nodes in this branch must be unlocked first!')
        return
      }
    }

    setBuying(true)
    try {
      // Deduct gold in Supabase
      const newGold = stats.gold - skill.goldCost
      const { error } = await supabase
        .from('stats')
        .update({ gold: newGold })
        .eq('user_id', profile.id)

      if (error) throw error

      // Save to local storage
      const saved = localStorage.getItem(`life_rpg_unlocked_${profile.id}`)
      const unlockedList = saved ? (JSON.parse(saved) as string[]) : []
      const newList = [...unlockedList, skill.id]
      localStorage.setItem(`life_rpg_unlocked_${profile.id}`, JSON.stringify(newList))

      // Update local state
      setSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, unlocked: true } : s))
      )

      toast.success(`Skill Unlocked: ${skill.name}! 🌟`)
      setActiveSkill((prev) => (prev?.id === skill.id ? { ...prev, unlocked: true } : prev))
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Purchase failed')
    } finally {
      setBuying(false)
    }
  }

  const filteredSkills = skills.filter((s) => selectedBranch === 'all' || s.branch === selectedBranch)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🌳</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Synchronizing Skill Matrix...
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
              Skill Tree 🌳
            </h1>
            <p style={{ color: '#9B99B8' }}>
              Unlock passive modifiers and specialized abilities using your Stats and Gold.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: branches and tree map */}
            <div className="lg:col-span-2 space-y-6">
              {/* Branch filters */}
              <div className="flex flex-wrap gap-2 p-1.5 rounded-xl" style={{ background: '#13131F', border: '1px solid #1E1E35' }}>
                {(['all', 'str', 'int', 'wis', 'vit', 'cha'] as const).map((branch) => (
                  <button
                    key={branch}
                    onClick={() => { setSelectedBranch(branch); setActiveSkill(null) }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-200"
                    style={{
                      background: selectedBranch === branch ? '#7C3AED' : 'transparent',
                      color: selectedBranch === branch ? '#F1F0FF' : '#9B99B8',
                    }}
                  >
                    {branch === 'all' ? 'All Skills' : branch.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Grid of skill tree nodes */}
              <div
                className="p-6 rounded-2xl min-h-[400px] flex flex-col justify-center relative overflow-hidden"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                {/* Visual connectors representation */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle, #7C3AED 1px, transparent 1px)
                    `,
                    backgroundSize: '24px 24px',
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10">
                  <AnimatePresence mode="popLayout">
                    {filteredSkills.map((skill) => {
                      const userStatVal = (stats as unknown as Record<string, number>)[skill.branch] ?? 0
                      const hasReq = userStatVal >= skill.statReq
                      const canUnlock = hasReq && (!skill.dependencies || skill.dependencies.every(depId => skills.find(s => s.id === depId)?.unlocked))

                      return (
                        <motion.button
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={skill.id}
                          onClick={() => setActiveSkill(skill)}
                          className="p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-center relative border group"
                          style={{
                            background: skill.unlocked
                              ? 'linear-gradient(135deg, #13131F, #7C3AED22)'
                              : '#0F0F1A',
                            borderColor: skill.unlocked
                              ? '#7C3AED'
                              : activeSkill?.id === skill.id
                              ? '#F59E0B'
                              : '#1E1E35',
                            boxShadow: skill.unlocked ? '0 0 15px #7C3AED22' : 'none',
                          }}
                        >
                          <div className="text-4xl mb-2 relative">
                            {skill.emoji}
                            {!skill.unlocked && (
                              <div
                                className="absolute -bottom-1 -right-1 p-1 rounded-full text-xs"
                                style={{ background: '#1A1A2E', color: canUnlock ? '#22C55E' : '#EF4444' }}
                              >
                                <Lock size={10} />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-sm block truncate w-full" style={{ color: '#F1F0FF' }}>
                            {skill.name}
                          </span>
                          <span className="text-xxs uppercase tracking-wider block mt-1" style={{ color: '#5C5A7A' }}>
                            {skill.branch} req: {skill.statReq}
                          </span>
                        </motion.button>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right side: stats snapshot & node details */}
            <div className="space-y-6">
              {/* Gold status */}
              <div
                className="p-5 rounded-2xl flex items-center justify-between"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                <div className="flex items-center gap-2">
                  <Coins size={20} style={{ color: '#F59E0B' }} />
                  <span className="font-semibold font-display" style={{ color: '#F1F0FF' }}>Gold Reserve</span>
                </div>
                <span className="text-2xl font-bold font-display" style={{ color: '#F59E0B' }}>
                  💰 {stats?.gold ?? 0}
                </span>
              </div>

              {/* Node detailed card */}
              <div
                className="p-6 rounded-2xl min-h-[300px]"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                {activeSkill ? (
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-5xl">{activeSkill.emoji}</span>
                        {activeSkill.unlocked ? (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                            style={{ background: '#22C55E22', color: '#22C55E' }}
                          >
                            <CheckCircle2 size={12} /> Mastered
                          </span>
                        ) : (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                            style={{ background: '#F59E0B22', color: '#F59E0B' }}
                          >
                            <Lock size={12} /> Locked
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold font-display mb-2" style={{ color: '#F1F0FF' }}>
                        {activeSkill.name}
                      </h3>
                      <p className="text-sm mb-6" style={{ color: '#9B99B8' }}>
                        {activeSkill.description}
                      </p>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: '#5C5A7A' }}>Branch</span>
                          <span className="uppercase font-semibold" style={{ color: '#9F67FF' }}>{activeSkill.branch}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: '#5C5A7A' }}>Requirement</span>
                          <span
                            className="font-semibold"
                            style={{
                              color:
                                ((stats as unknown as Record<string, number>)[activeSkill.branch] ?? 0) >= activeSkill.statReq
                                  ? '#22C55E'
                                  : '#EF4444',
                            }}
                          >
                            {activeSkill.branch.toUpperCase()} {activeSkill.statReq} (Your Lv: {(stats as unknown as Record<string, number>)[activeSkill.branch] ?? 0})
                          </span>
                        </div>
                        {activeSkill.dependencies && (
                          <div className="flex justify-between text-xs">
                            <span style={{ color: '#5C5A7A' }}>Prerequisites</span>
                            <span style={{ color: '#9B99B8' }}>
                              {activeSkill.dependencies
                                .map((id) => skills.find((s) => s.id === id)?.name)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {!activeSkill.unlocked && (
                      <button
                        onClick={() => handleUnlock(activeSkill)}
                        disabled={buying}
                        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                        style={{
                          background:
                            ((stats as unknown as Record<string, number>)[activeSkill.branch] ?? 0) >= activeSkill.statReq &&
                            stats.gold >= activeSkill.goldCost
                              ? '#F59E0B'
                              : '#2E2E50',
                          color: '#0F0F1A',
                          cursor:
                            ((stats as unknown as Record<string, number>)[activeSkill.branch] ?? 0) >= activeSkill.statReq &&
                            stats.gold >= activeSkill.goldCost
                              ? 'pointer'
                              : 'not-allowed',
                        }}
                      >
                        <Sparkles size={16} />
                        {buying ? 'Unlocking...' : `Unlock with 💰 ${activeSkill.goldCost} Gold`}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <BookOpen size={40} className="mb-4" style={{ color: '#5C5A7A' }} />
                    <h4 className="font-semibold font-display mb-1 animate-pulse" style={{ color: '#9B99B8' }}>
                      Inspect Node
                    </h4>
                    <p className="text-xs max-w-[200px]" style={{ color: '#5C5A7A' }}>
                      Select a node from the tree to view requirements and unlock details.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
