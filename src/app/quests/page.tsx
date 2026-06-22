'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import XPBar from '@/components/ui/XPBar'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

const DIFFICULTY_XP: Record<string, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  legendary: 100,
}

const STAT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  str: { label: 'STR', icon: '💪', color: '#EF4444' },
  int: { label: 'INT', icon: '🧠', color: '#3B82F6' },
  wis: { label: 'WIS', icon: '🧘', color: '#22C55E' },
  vit: { label: 'VIT', icon: '❤️', color: '#EF4444' },
  gold: { label: 'GOLD', icon: '💰', color: '#F59E0B' },
  cha: { label: 'CHA', icon: '🗣️', color: '#9F67FF' },
}

export default function QuestsPage() {
  const { profile, habits, loading, refetch } = useProfile()
  const supabase = createClient()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [statCategory, setStatCategory] = useState('str')
  const [emoji, setEmoji] = useState('⚔️')
  const [submitting, setSubmitting] = useState(false)

  async function handleAddQuest(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const xp = DIFFICULTY_XP[difficulty] ?? 10
      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: name.trim(),
        difficulty,
        xp_reward: xp,
        stat_category: statCategory,
        emoji: emoji.trim() || '📋',
        is_active: true,
      })

      if (error) throw error

      toast.success('New Quest Drafted!')
      setIsAddOpen(false)
      setName('')
      setDifficulty('easy')
      setStatCategory('str')
      setEmoji('⚔️')
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create quest')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteQuest(habitId: string) {
    try {
      // Soft delete by setting is_active to false, keeping completions history clean
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId)

      if (error) throw error

      toast.success('Quest removed from board')
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete quest')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚔️</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Updating Quest Ledger...
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>
                Quest Board 📋
              </h1>
              <p style={{ color: '#9B99B8' }}>
                Manage your daily objectives, physical trials, and mental training.
              </p>
            </div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: '#7C3AED',
                color: '#F1F0FF',
                fontFamily: 'Oxanium, sans-serif',
                boxShadow: '0 0 15px #7C3AED44',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#7C3AED')}
            >
              <Plus size={18} />
              Draft New Quest
            </button>
          </div>

          {/* User Status Bar */}
          <div
            className="mb-8 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{ background: '#13131F', border: '1px solid #1E1E35' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{profile?.avatar_emoji ?? '⚔️'}</span>
              <div>
                <h3 className="font-semibold font-display" style={{ color: '#F1F0FF' }}>
                  {profile?.display_name ?? 'Adventurer'}
                </h3>
                <span className="text-xs" style={{ color: '#F59E0B' }}>
                  Level {profile?.level ?? 1} Warrior
                </span>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <XPBar
                currentXP={profile?.xp ?? 0}
                maxXP={profile?.xp_to_next ?? 100}
                level={profile?.level ?? 1}
              />
            </div>
          </div>

          {/* Quests list */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-display" style={{ color: '#F1F0FF' }}>
              Active Quests ({habits.length})
            </h2>

            {habits.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                <div className="text-5xl mb-4">📜</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#F1F0FF' }}>
                  No active quests in your journal
                </h3>
                <p className="text-sm max-w-md mx-auto mb-6" style={{ color: '#5C5A7A' }}>
                  Your daily slate is clear. Create a few custom daily tasks to start earning experience and leveling up your stats!
                </p>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{ background: '#1E1E35', border: '1px solid #2E2E50', color: '#9F67FF' }}
                >
                  Create Your First Quest
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {habits.map((habit) => {
                    const stat = STAT_CONFIG[habit.stat_category] ?? { label: 'STR', icon: '💪', color: '#EF4444' }
                    return (
                      <motion.div
                        layout
                        key={habit.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl p-5 flex items-start gap-4"
                        style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                      >
                        <div className="text-3xl p-2 rounded-lg bg-black/20 flex-shrink-0">
                          {habit.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate mb-1" style={{ color: '#F1F0FF' }}>
                            {habit.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <DifficultyBadge difficulty={habit.difficulty} />
                            <span className="text-xs px-2 py-0.5 rounded bg-black/20" style={{ color: stat.color }}>
                              {stat.icon} {stat.label}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}>
                              +{habit.xp_reward} XP
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteQuest(habit.id)}
                          className="p-2 rounded-lg transition-colors text-slate-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Quest Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-6 border"
              style={{ background: '#13131F', borderColor: '#7C3AED44' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <BookOpen size={24} style={{ color: '#F59E0B' }} />
                <h3 className="text-xl font-bold font-display" style={{ color: '#F1F0FF' }}>
                  Draft Custom Quest
                </h3>
              </div>

              <form onSubmit={handleAddQuest} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5" style={{ color: '#9B99B8' }}>
                    Quest Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Hit the gym, Read 30 mins, Code project"
                    className="w-full px-4 py-3 rounded-lg outline-none"
                    style={{ background: '#0F0F1A', border: '1px solid #1E1E35', color: '#F1F0FF' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9B99B8' }}>
                      Primary Stat
                    </label>
                    <select
                      value={statCategory}
                      onChange={(e) => setStatCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{ background: '#0F0F1A', border: '1px solid #1E1E35', color: '#F1F0FF' }}
                    >
                      {Object.entries(STAT_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.icon} {val.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: '#9B99B8' }}>
                      Difficulty / XP
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg outline-none"
                      style={{ background: '#0F0F1A', border: '1px solid #1E1E35', color: '#F1F0FF' }}
                    >
                      <option value="easy">Easy (+10 XP)</option>
                      <option value="medium">Medium (+25 XP)</option>
                      <option value="hard">Hard (+50 XP)</option>
                      <option value="legendary">Legendary (+100 XP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2">
                    <label className="block text-sm mb-1.5" style={{ color: '#9B99B8' }}>
                      Emoji Icon
                    </label>
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      placeholder="e.g. 🏋️, 📚, 🧘"
                      className="w-full px-4 py-3 rounded-lg outline-none text-center"
                      style={{ background: '#0F0F1A', border: '1px solid #1E1E35', color: '#F1F0FF' }}
                    />
                  </div>
                  <div className="text-center p-3 rounded-lg text-4xl" style={{ background: '#0F0F1A', border: '1px solid #1E1E35' }}>
                    {emoji || '📋'}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t" style={{ borderColor: '#1E1E35' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-3 rounded-lg font-medium text-sm transition-colors"
                    style={{ background: '#1E1E35', color: '#9B99B8' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                    style={{ background: '#7C3AED', color: '#F1F0FF' }}
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'Publish Quest'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
