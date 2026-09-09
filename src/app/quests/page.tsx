'use client'

export const dynamic = 'force-dynamic'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, CheckCircle2, Pencil, Trash2, Loader2,
  Dumbbell, Brain, Wind, Heart, Coins, Mic2,
  AlertTriangle, PartyPopper, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import QuestModal, { QuestFormData } from '@/components/quests/QuestModal'
import { useProfile } from '@/hooks/useProfile'
import { useCompleteHabit } from '@/hooks/useCompleteHabit'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES: Record<string, { label: string; icon: React.ComponentType<{ size?: number }>; color: string }> = {
  str:  { label: 'Strength',     icon: Dumbbell, color: '#EF4444' },
  int:  { label: 'Intelligence', icon: Brain,    color: '#3B82F6' },
  wis:  { label: 'Wisdom',       icon: Wind,     color: '#8B5CF6' },
  vit:  { label: 'Vitality',     icon: Heart,    color: '#10B981' },
  gold: { label: 'Wealth',       icon: Coins,    color: '#D97706' },
  cha:  { label: 'Charisma',     icon: Mic2,     color: '#EC4899' },
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  legendary: 'Legendary',
}
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#059669',
  medium: '#D97706',
  hard: '#DC2626',
  legendary: '#5B57F0',
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl p-6 bg-white border border-[#EAE6DD] shadow-xl"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-[#FEE2E2] text-[#DC2626]"
            >
              <AlertTriangle size={22} />
            </div>
            <h3
              className="text-lg font-bold mb-1 text-[#232019]"
            >
              Abandon this Quest?
            </h3>
            <p className="text-sm font-semibold mb-1 text-[#6E6A61]">
              &ldquo;{habitName}&rdquo;
            </p>
            <p className="text-xs mb-6 text-[#8A857A]">
              Your streak and completion history will be archived.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#FAF8F5] border border-[#EAE6DD] text-[#6E6A61] hover:bg-[#F0ECE1]"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm"
              >
                Abandon Quest
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
  const CatIcon = cat.icon
  const diffColor = DIFFICULTY_COLORS[habit.difficulty] ?? '#8A857A'
  const diffLabel = DIFFICULTY_LABELS[habit.difficulty] ?? habit.difficulty

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl p-4 flex items-start gap-4 transition-all duration-200 border bg-white shadow-sm ${
        isCompleted ? 'border-[#A7F3D0] bg-[#ECFDF5]/50' : 'border-[#EAE6DD]'
      }`}
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}30`, color: cat.color }}
      >
        {habit.emoji ? habit.emoji : <CatIcon size={22} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-bold text-sm mb-0.5 truncate flex items-center gap-1.5"
          style={{ color: isCompleted ? '#059669' : '#232019' }}
        >
          {isCompleted && <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-600" />}
          <span className={`truncate ${isCompleted ? 'line-through opacity-75' : ''}`}>{habit.name}</span>
        </h3>
        {habit.description && (
          <p className="text-xs mb-2 line-clamp-1 text-[#8A857A]">
            {habit.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span
            className="text-[11px] px-2 py-0.5 rounded-md font-bold"
            style={{ backgroundColor: `${diffColor}15`, color: diffColor }}
          >
            {diffLabel}
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1"
            style={{ backgroundColor: '#FAF8F5', color: '#6E6A61', border: '1px solid #EAE6DD' }}
          >
            <CatIcon size={11} /> {cat.label}
          </span>
          <span className="text-[11px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#EDECFD] text-[#5B57F0]">
            <Zap size={11} className="fill-current" /> +{habit.xp_reward} XP
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onComplete(habit.id)}
          disabled={isCompleted}
          title={isCompleted ? 'Already completed!' : 'Complete quest'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-[#D6D3FA] text-[#5B57F0] hover:bg-[#EDECFD]'
          }`}
        >
          <CheckCircle2 size={17} />
        </button>
        <button
          onClick={() => onEdit(habit)}
          title="Edit quest"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-[#8A857A] hover:bg-[#FAF8F5] hover:text-[#232019]"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(habit)}
          title="Delete quest"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-[#8A857A] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
        >
          <Trash2 size={15} />
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

      const multiplierText = result.multiplier > 1 ? ` (${result.multiplier}x Streak Bonus)` : ''
      toast.success(`+${result.xp_earned} XP Quest Complete!${multiplierText}`, {
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
    toast.success('New Quest added!')
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
      <div className="flex items-center justify-center min-h-screen bg-[#FBFAF7]">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin mb-3 mx-auto text-[#5B57F0]" />
          <div className="text-sm font-semibold text-[#6E6A61]">
            Loading quests...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Sidebar
        userAvatar={profile?.avatar_emoji}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
        completedToday={allCompleted.length}
      />

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240 }}>
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold mb-1 flex items-center gap-2.5 text-[#232019]">
                <Zap size={26} className="text-[#D97706] fill-current" />
                <span>Quest Ledger</span>
              </h1>
              <p className="text-sm font-medium text-[#8A857A]">
                <span className="font-bold text-[#5B57F0]">{habits.length}</span> active quests •{' '}
                <span className="font-bold text-[#D97706]">{habits.reduce((s, h) => s + h.xp_reward, 0)} XP</span> available today
              </p>
            </div>
            <button
              onClick={() => { setEditingHabit(null); setIsModalOpen(true) }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#5B57F0] hover:bg-[#4F46E5] shadow-sm transition-all whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Create New Quest</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === tab
                    ? 'bg-[#EDECFD] text-[#5B57F0] border-[#D6D3FA] shadow-sm'
                    : 'bg-white text-[#6E6A61] border-[#EAE6DD] hover:bg-[#FAF8F5]'
                }`}
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeHabits.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-white border border-[#EAE6DD] shadow-sm">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-[#ECFDF5] text-emerald-600">
                      <PartyPopper size={28} />
                    </div>
                    <h3 className="text-lg font-bold mb-1 text-[#232019]">
                      All Quests Complete!
                    </h3>
                    <p className="text-xs text-[#8A857A] mb-4">
                      You&apos;ve cleared today&apos;s quest list. Enjoy your hero streak!
                    </p>
                    <button
                      onClick={() => { setEditingHabit(null); setIsModalOpen(true) }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5B57F0] hover:bg-[#4F46E5] shadow-sm"
                    >
                      + Add Another Quest
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(grouped).map(([catKey, categoryHabits]) => {
                      const cat = CATEGORIES[catKey] ?? CATEGORIES.str
                      const CatIcon = cat.icon
                      return (
                        <div key={catKey}>
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                            >
                              <CatIcon size={13} />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A857A]">
                              {cat.label} ({categoryHabits.length})
                            </h2>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryHabits.map((habit) => (
                              <QuestCard
                                key={habit.id}
                                habit={habit}
                                isCompleted={false}
                                onComplete={handleComplete}
                                onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }}
                                onDelete={(h) => setDeleteTarget(h)}
                              />
                            ))}
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {completedHabits.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-white border border-[#EAE6DD] shadow-sm">
                    <p className="text-sm font-semibold text-[#8A857A]">No quests completed yet today.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {completedHabits.map((habit) => (
                      <QuestCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={true}
                        onComplete={handleComplete}
                        onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }}
                        onDelete={(h) => setDeleteTarget(h)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <QuestModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingHabit(null) }}
        onSubmit={editingHabit ? handleEditQuest : handleAddQuest}
        initialData={editingHabit ? {
          name: editingHabit.name,
          description: editingHabit.description ?? '',
          difficulty: editingHabit.difficulty,
          xp_reward: editingHabit.xp_reward,
          stat_category: editingHabit.stat_category,
          emoji: editingHabit.emoji,
        } : undefined}
      />

      <DeleteDialog
        isOpen={!!deleteTarget}
        habitName={deleteTarget?.name ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
