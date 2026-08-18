import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Dumbbell, Brain, Wind, Heart, Coins, Mic2, Zap, Clock, Timer, Layers, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { key: 'str',  label: 'Strength',     icon: Dumbbell, color: '#EF4444' },
  { key: 'int',  label: 'Intelligence', icon: Brain,    color: '#3B82F6' },
  { key: 'wis',  label: 'Wisdom',       icon: Wind,     color: '#8B5CF6' },
  { key: 'vit',  label: 'Vitality',     icon: Heart,    color: '#22C55E' },
  { key: 'gold', label: 'Wealth',       icon: Coins,    color: '#F59E0B' },
  { key: 'cha',  label: 'Charisma',     icon: Mic2,     color: '#EC4899' },
]

const DIFFICULTIES = [
  { key: 'easy',      label: 'Easy',      xp: 10  },
  { key: 'medium',    label: 'Medium',    xp: 25  },
  { key: 'hard',      label: 'Hard',      xp: 50  },
  { key: 'legendary', label: 'Legendary', xp: 100 },
]

const EMOJI_OPTIONS = [
  '💪','🧠','🧘','💰','❤️','🗣️','📚','🏃','🥗','😴',
  '💧','📝','🎯','🔥','⚡','🌟','💎','🏆','📖','🎵',
  '🎨','💻','🌱','🤝','💫','🧪','🏋️','📊','🎮','🌙',
]

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export interface QuestFormData {
  id?: string
  name: string
  description: string
  stat_category: string
  difficulty: string
  xp_reward: number
  emoji: string
  frequency: 'daily' | 'weekly' | 'custom'
  custom_days: number[]
  scheduled_time?: string
  duration_minutes?: number
  trigger_habit_id?: string
  implementation_intention?: string
}

interface QuestModalProps {
  isOpen: boolean
  initialData?: Partial<QuestFormData>
  editMode?: boolean
  onClose: () => void
  onSubmit: (data: QuestFormData) => Promise<void>
}

export default function QuestModal({
  isOpen,
  initialData,
  editMode = false,
  onClose,
  onSubmit,
}: QuestModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('str')
  const [difficulty, setDifficulty] = useState('easy')
  const [emoji, setEmoji] = useState('⚔️')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [customDays, setCustomDays] = useState<number[]>([])
  const [scheduledTime, setScheduledTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(20)
  const [triggerHabitId, setTriggerHabitId] = useState('')
  const [implementationIntention, setImplementationIntention] = useState('')
  const [otherHabits, setOtherHabits] = useState<Array<{ id: string; name: string }>>([])
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  // Fetch other habits for Habit Stacking dropdown
  useEffect(() => {
    async function loadOtherHabits() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (data) {
        setOtherHabits(data.filter((h: { id: string; name: string }) => h.id !== initialData?.id))
      }
    }
    if (isOpen) {
      loadOtherHabits()
    }
  }, [isOpen, initialData?.id, supabase])

  // Populate from initialData when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '')
      setDescription(initialData.description ?? '')
      setCategory(initialData.stat_category ?? 'str')
      setDifficulty(initialData.difficulty ?? 'easy')
      setEmoji(initialData.emoji ?? '⚔️')
      setFrequency(initialData.frequency ?? 'daily')
      setCustomDays(initialData.custom_days ?? [])
      setScheduledTime(initialData.scheduled_time ?? '')
      setDurationMinutes(initialData.duration_minutes ?? 20)
      setTriggerHabitId(initialData.trigger_habit_id ?? '')
      setImplementationIntention(initialData.implementation_intention ?? '')
    }
  }, [initialData, isOpen])

  const currentXP = DIFFICULTIES.find((d) => d.key === difficulty)?.xp ?? 10

  function toggleDay(idx: number) {
    setCustomDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    )
  }

  function generateIntentionTemplate() {
    const habitName = name.trim() || 'this quest'
    const timeStr = scheduledTime ? `at ${scheduledTime}` : 'in the morning'
    setImplementationIntention(`When I finish my morning routine, I will ${habitName} ${timeStr} at my desk.`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        stat_category: category,
        difficulty,
        xp_reward: currentXP,
        emoji: emoji || '📋',
        frequency,
        custom_days: customDays,
        scheduled_time: scheduledTime || undefined,
        duration_minutes: durationMinutes,
        trigger_habit_id: triggerHabitId || undefined,
        implementation_intention: implementationIntention || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#13131F', border: '1px solid #7C3AED44' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: '#1E1E35' }}
            >
              <h3
                className="text-xl font-bold font-display"
                style={{ color: '#F1F0FF' }}
              >
                {editMode ? 'Edit Quest' : 'New Quest'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
            >
              {/* Quest Name */}
              <div>
                <label className="block text-sm mb-1.5 font-medium text-slate-300">
                  Quest Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Morning Workout, Read 20 Pages"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm bg-[#0F0F1A] border border-slate-800 text-white focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-300">
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = category === cat.key
                    const IconComp = cat.icon
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className="p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all duration-150 text-center"
                        style={{
                          background: active ? `${cat.color}22` : '#0F0F1A',
                          border: `1px solid ${active ? cat.color : '#1E1E35'}`,
                          boxShadow: active ? `0 0 12px ${cat.color}33` : 'none',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${cat.color}15`, color: cat.color }}
                        >
                          <IconComp size={16} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: active ? cat.color : '#9B99B8' }}>
                          {cat.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Difficulty Picker */}
              <div>
                <label className="block text-sm mb-2 font-medium flex items-center gap-1.5 text-slate-300">
                  <span>Difficulty —</span>
                  <span className="inline-flex items-center gap-1 text-purple-400 font-display font-semibold">
                    <Zap size={12} /> {currentXP} XP reward
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DIFFICULTIES.map((d) => {
                    const active = difficulty === d.key
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDifficulty(d.key)}
                        className="py-2.5 px-1 rounded-xl text-xs font-semibold transition-all duration-150 text-center font-display"
                        style={{
                          background: active ? '#7C3AED' : '#0F0F1A',
                          color: active ? '#F1F0FF' : '#9B99B8',
                          border: `1px solid ${active ? '#7C3AED' : '#1E1E35'}`,
                          boxShadow: active ? '0 0 12px #7C3AED44' : 'none',
                        }}
                      >
                        <div>{d.label}</div>
                        <div style={{ color: active ? '#C4A8FF' : '#5C5A7A' }}>+{d.xp} XP</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Scheduled Time & Duration (Phase 2A) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-400" />
                      <span>Scheduled Time</span>
                    </label>
                  </div>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm bg-[#0F0F1A] border border-slate-800 text-white focus:border-purple-500"
                  />
                  <p className="text-[11px] text-amber-400/80 mt-1">
                    ⚡ Adding a time = 2x more likely to complete
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                      <Timer size={14} className="text-purple-400" />
                      <span>Duration</span>
                    </label>
                    <span className="text-xs text-purple-400 font-bold font-display">~{durationMinutes} min</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>5m</span>
                    <span>30m</span>
                    <span>60m</span>
                    <span>120m</span>
                  </div>
                </div>
              </div>

              {/* Habit Stacking (Phase 2A) */}
              {otherHabits.length > 0 && (
                <div>
                  <label className="block text-sm mb-1.5 font-medium text-slate-300 flex items-center gap-1.5">
                    <Layers size={14} className="text-cyan-400" />
                    <span>Habit Stacking (Trigger Habit)</span>
                  </label>
                  <select
                    value={triggerHabitId}
                    onChange={(e) => setTriggerHabitId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm bg-[#0F0F1A] border border-slate-800 text-white focus:border-purple-500"
                  >
                    <option value="">No trigger (Standalone Quest)</option>
                    {otherHabits.map((h) => (
                      <option key={h.id} value={h.id}>
                        Do this immediately AFTER: {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Implementation Intention (Phase 2A) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-pink-400" />
                    <span>Implementation Intention</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateIntentionTemplate}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Auto-Fill Template ✨
                  </button>
                </div>
                <input
                  type="text"
                  value={implementationIntention}
                  onChange={(e) => setImplementationIntention(e.target.value)}
                  placeholder="When [situation], I will [habit] at [time] in [location]"
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm bg-[#0F0F1A] border border-slate-800 text-white focus:border-purple-500"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm mb-2 font-medium text-slate-300">
                  Frequency
                </label>
                <div className="flex gap-2 mb-3">
                  {(['daily', 'weekly', 'custom'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
                      style={{
                        background: frequency === f ? '#7C3AED22' : '#0F0F1A',
                        color: frequency === f ? '#9F67FF' : '#9B99B8',
                        border: `1px solid ${frequency === f ? '#7C3AED' : '#1E1E35'}`,
                      }}
                    >
                      {f === 'daily' ? 'Daily' : f === 'weekly' ? 'Weekly' : 'Custom Days'}
                    </button>
                  ))}
                </div>
                {frequency === 'custom' && (
                  <div className="flex gap-1.5">
                    {DAYS.map((day, idx) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: customDays.includes(idx) ? '#7C3AED' : '#0F0F1A',
                          color: customDays.includes(idx) ? '#F1F0FF' : '#5C5A7A',
                          border: `1px solid ${customDays.includes(idx) ? '#7C3AED' : '#1E1E35'}`,
                        }}
                      >
                        {day.slice(0, 1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm mb-1.5 font-medium text-slate-300">
                  Notes / Details <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="What does completing this look like?"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none bg-[#0F0F1A] border border-slate-800 text-white focus:border-purple-500"
                />
              </div>
            </form>

            {/* Footer Buttons */}
            <div
              className="flex gap-3 px-6 py-4 border-t flex-shrink-0"
              style={{ borderColor: '#1E1E35' }}
            >
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-medium text-sm text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 font-display bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : editMode ? (
                  'Save Changes'
                ) : (
                  'Add Quest ⚔️'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
