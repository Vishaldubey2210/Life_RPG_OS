'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import QuestModal, { QuestFormData } from '@/components/quests/QuestModal'
import { useProfile } from '@/hooks/useProfile'
import { useCompleteHabit } from '@/hooks/useCompleteHabit'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  str:  { label: 'Strength',     icon: '💪', color: '#EF4444' },
  int:  { label: 'Intelligence', icon: '🧠', color: '#3B82F6' },
  wis:  { label: 'Wisdom',       icon: '🧘', color: '#8B5CF6' },
  vit:  { label: 'Vitality',     icon: '❤️', color: '#22C55E' },
  gold: { label: 'Wealth',       icon: '💰', color: '#F59E0B' },
  cha:  { label: 'Charisma',     icon: '🗣️', color: '#EC4899' },
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  legendary: 'Legendary',
}
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
  legendary: '#7C3AED',
}

interface Habit {
  id: string
  name: string
  difficulty: string
  xp_reward: number
  stat_category: string
  emoji: string
  is_active: boolean
  description?: string
}

interface DeleteDialogProps {
  isOpen: boolean
  habitName: string
  onCancel: () => void
  onConfirm: () => void
}

function DeleteDialog({ isOpen, habitName, onCancel, onConfirm }: DeleteDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: '#13131F', border: '1px solid #EF444444' }}
          >
            <div className="text-3xl mb-3">⚠️</div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
            >
              Abandon this Quest?
            </h3>
            <p className="text-sm mb-1" style={{ color: '#9B99B8' }}>
              "{habitName}"
            </p>
            <p className="text-sm mb-6" style={{ color: '#5C5A7A' }}>
              Your streak and completion history will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: '#1E1E35', color: '#9B99B8' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444' }}
              >
                Delete Quest
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

interface QuestCardProps {
  habit: Habit
  isCompleted: boolean
  onComplete: (id: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (habit: Habit) => void
}

function QuestCard({ habit, isCompleted, onComplete, onEdit, onDelete }: QuestCardProps) {
  const cat = CATEGORIES[habit.stat_category] ?? CATEGORIES.str
  const diffColor = DIFFICULTY_COLORS[habit.difficulty] ?? '#9B99B8'
  const diffLabel = DIFFICULTY_LABELS[habit.difficulty] ?? habit.difficulty

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl p-4 flex items-start gap-4 transition-all duration-200 group"
      style={{
        background: isCompleted ? '#0F1A0F' : '#13131F',
        border: `1px solid ${isCompleted ? '#22C55E33' : '#1E1E35'}`,
        opacity: isCompleted ? 0.75 : 1,
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}44` }}
      >
        {habit.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-bold text-sm mb-0.5 truncate"
          style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
        >
          {isCompleted && '✅ '}{habit.name}
        </h3>
        {habit.description && (
          <p className="text-xs mb-2 line-clamp-1" style={{ color: '#5C5A7A' }}>
            {habit.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${diffColor}22`, color: diffColor }}
          >
            {diffLabel}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: `${cat.color}15`, color: cat.color }}
          >
            {cat.icon} {cat.label}
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}
          >
            ⚡ {habit.xp_reward} XP
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onComplete(habit.id)}
          disabled={isCompleted}
          title={isCompleted ? 'Already completed!' : 'Complete quest'}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{
            background: isCompleted ? '#22C55E22' : '#22C55E15',
            color: isCompleted ? '#22C55E' : '#5C5A7A',
            border: `1px solid ${isCompleted ? '#22C55E44' : 'transparent'}`,
          }}
          onMouseEnter={(e) => {
            if (!isCompleted) {
              e.currentTarget.style.background = '#22C55E22'
              e.currentTarget.style.color = '#22C55E'
            }
          }}
          onMouseLeave={(e) => {
            if (!isCompleted) {
              e.currentTarget.style.background = '#22C55E15'
              e.currentTarget.style.color = '#5C5A7A'
            }
          }}
        >
          <CheckCircle2 size={16} />
        </button>
        <button
          onClick={() => onEdit(habit)}
          title="Edit quest"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{ color: '#5C5A7A' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1E1E35'
            e.currentTarget.style.color = '#9F67FF'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#5C5A7A'
          }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(habit)}
          title="Delete quest"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{ color: '#5C5A7A' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#EF444415'
            e.currentTarget.style.color = '#EF4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#5C5A7A'
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}

export default function QuestsPage() {
  const { profile, habits, completions_today, loading, refetch } = useProfile()
  const { completeHabit } = useCompleteHabit()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null)
  const [completedLocally, setCompletedLocally] = useState<string[]>([])
  const [savingId, setSavingId] = useState<string | null>(null)

  const allCompleted = [...completions_today, ...completedLocally]

  const activeHabits = (habits as Habit[]).filter((h) => !allCompleted.includes(h.id))
  const completedHabits = (habits as Habit[]).filter((h) => allCompleted.includes(h.id))

  // Group active habits by category
  const grouped = Object.entries(CATEGORIES).reduce<Record<string, Habit[]>>((acc, [key]) => {
    const group = activeHabits.filter((h) => h.stat_category === key)
    if (group.length > 0) acc[key] = group
    return acc
  }, {})

  const handleComplete = useCallback(
    async (habitId: string) => {
      if (allCompleted.includes(habitId) || savingId === habitId) return
      setSavingId(habitId)
      setCompletedLocally((prev) => [...prev, habitId])

      const result = await completeHabit(habitId)
      setSavingId(null)

      if (!result) {
        toast.error('Failed to complete quest')
        setCompletedLocally((prev) => prev.filter((id) => id !== habitId))
        return
      }

      const multiplierText = result.multiplier > 1 ? ` (${result.multiplier}x 🔥)` : ''
      toast.success(`+${result.xp_earned} XP ⚡ Quest Complete!${multiplierText}`, {
        duration: 3000,
      })
      refetch()
    },
    [allCompleted, savingId, completeHabit, refetch]
  )

  async function handleAddQuest(data: QuestFormData) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) { toast.error('Not authenticated'); return }

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: data.name,
      description: data.description || null,
      difficulty: data.difficulty,
      xp_reward: data.xp_reward,
      stat_category: data.stat_category,
      emoji: data.emoji,
      is_active: true,
    })

    if (error) { toast.error('Failed to create quest'); throw error }
    toast.success('New Quest added! 🎯')
    setIsModalOpen(false)
    refetch()
  }

  async function handleEditQuest(data: QuestFormData) {
    if (!editingHabit) return
    const { error } = await supabase.from('habits').update({
      name: data.name,
      description: data.description || null,
      difficulty: data.difficulty,
      xp_reward: data.xp_reward,
      stat_category: data.stat_category,
      emoji: data.emoji,
    }).eq('id', editingHabit.id)

    if (error) { toast.error('Failed to update quest'); throw error }
    toast.success('Quest updated!')
    setEditingHabit(null)
    refetch()
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', deleteTarget.id)
    if (error) { toast.error('Failed to delete quest'); return }
    toast.success('Quest abandoned')
    setDeleteTarget(null)
    refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mb-4 mx-auto" style={{ color: '#7C3AED' }} />
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Loading quests...
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
        completedToday={allCompleted.length}
      />

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240 }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-3xl font-bold mb-1"
                style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
              >
                Quest Manager ⚡
              </h1>
              <p style={{ color: '#9B99B8' }}>
                <span style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}>
                  {habits.length}
                </span>{' '}
                active quests •{' '}
                <span style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}>
                  {habits.reduce((s, h) => s + h.xp_reward, 0)} XP
                </span>{' '}
                available today
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setEditingHabit(null); setIsModalOpen(true) }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap"
              style={{
                background: '#7C3AED',
                color: '#F1F0FF',
                fontFamily: 'Oxanium, sans-serif',
                boxShadow: '0 0 20px #7C3AED44',
              }}
            >
              <Plus size={18} />
              + New Quest
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200"
                style={{
                  background: activeTab === tab ? '#7C3AED' : '#13131F',
                  color: activeTab === tab ? '#F1F0FF' : '#9B99B8',
                  border: `1px solid ${activeTab === tab ? '#7C3AED' : '#1E1E35'}`,
                  fontFamily: 'Oxanium, sans-serif',
                }}
              >
                {tab === 'active' ? `Active Quests (${activeHabits.length})` : `Completed Today (${completedHabits.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'active' ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeHabits.length === 0 ? (
                  <div
                    className="text-center py-16 rounded-2xl"
                    style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                  >
                    <div className="text-5xl mb-4">🎉</div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
                    >
                      All Quests Complete!
                    </h3>
                    <p className="text-sm" style={{ color: '#5C5A7A' }}>
                      Legendary performance. Come back tomorrow for new quests!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(grouped).map(([catKey, catHabits]) => {
                      const cat = CATEGORIES[catKey]
                      return (
                        <div key={catKey}>
                          {/* Category Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                              style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}44` }}
                            >
                              {cat.icon}
                            </div>
                            <h2
                              className="font-bold text-sm uppercase tracking-wider"
                              style={{ fontFamily: 'Oxanium, sans-serif', color: cat.color }}
                            >
                              {cat.label}
                            </h2>
                            <div className="flex-1 h-px" style={{ background: `${cat.color}22` }} />
                            <span className="text-xs" style={{ color: '#5C5A7A' }}>
                              {catHabits.length} quest{catHabits.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <AnimatePresence mode="popLayout">
                              {catHabits.map((habit) => (
                                <QuestCard
                                  key={habit.id}
                                  habit={habit}
                                  isCompleted={allCompleted.includes(habit.id)}
                                  onComplete={handleComplete}
                                  onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }}
                                  onDelete={setDeleteTarget}
                                />
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {completedHabits.length === 0 ? (
                  <div
                    className="text-center py-16 rounded-2xl"
                    style={{ background: '#13131F', border: '1px solid #1E1E35' }}
                  >
                    <div className="text-5xl mb-4">📋</div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
                    >
                      No completions yet today
                    </h3>
                    <p className="text-sm" style={{ color: '#5C5A7A' }}>
                      Go complete some quests and see them here!
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* XP Summary Card */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl mb-5 flex items-center justify-between"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED22, #22C55E22)',
                        border: '1px solid #22C55E44',
                      }}
                    >
                      <div>
                        <div className="text-sm font-medium mb-0.5" style={{ color: '#9B99B8' }}>
                          XP Earned Today
                        </div>
                        <div
                          className="text-3xl font-bold"
                          style={{ fontFamily: 'Oxanium, sans-serif', color: '#22C55E' }}
                        >
                          ⚡ {completedHabits.reduce((s, h) => s + h.xp_reward, 0)} XP
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className="text-4xl font-bold"
                          style={{ fontFamily: 'Oxanium, sans-serif', color: '#F59E0B' }}
                        >
                          {completedHabits.length}
                        </div>
                        <div className="text-xs" style={{ color: '#5C5A7A' }}>quests done</div>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {completedHabits.map((habit) => (
                        <QuestCard
                          key={habit.id}
                          habit={habit}
                          isCompleted
                          onComplete={handleComplete}
                          onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }}
                          onDelete={setDeleteTarget}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add / Edit Modal */}
      <QuestModal
        isOpen={isModalOpen}
        editMode={!!editingHabit}
        initialData={
          editingHabit
            ? {
                name: editingHabit.name,
                description: editingHabit.description ?? '',
                stat_category: editingHabit.stat_category,
                difficulty: editingHabit.difficulty,
                xp_reward: editingHabit.xp_reward,
                emoji: editingHabit.emoji,
                frequency: 'daily',
                custom_days: [],
              }
            : undefined
        }
        onClose={() => { setIsModalOpen(false); setEditingHabit(null) }}
        onSubmit={editingHabit ? handleEditQuest : handleAddQuest}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={!!deleteTarget}
        habitName={deleteTarget?.name ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
