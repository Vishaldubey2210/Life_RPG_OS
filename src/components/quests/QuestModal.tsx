'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'

const CATEGORIES = [
  { key: 'str',  label: 'Strength',     icon: '💪', color: '#EF4444' },
  { key: 'int',  label: 'Intelligence', icon: '🧠', color: '#3B82F6' },
  { key: 'wis',  label: 'Wisdom',       icon: '🧘', color: '#8B5CF6' },
  { key: 'vit',  label: 'Vitality',     icon: '❤️', color: '#22C55E' },
  { key: 'gold', label: 'Wealth',       icon: '💰', color: '#F59E0B' },
  { key: 'cha',  label: 'Charisma',     icon: '🗣️', color: '#EC4899' },
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
  name: string
  description: string
  stat_category: string
  difficulty: string
  xp_reward: number
  emoji: string
  frequency: 'daily' | 'weekly' | 'custom'
  custom_days: number[]
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
  const [submitting, setSubmitting] = useState(false)

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
    }
  }, [initialData, isOpen])

  const currentXP = DIFFICULTIES.find((d) => d.key === difficulty)?.xp ?? 10

  function toggleDay(idx: number) {
    setCustomDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    )
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
            className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: '#13131F', border: '1px solid #7C3AED44' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: '#1E1E35' }}
            >
              <h3
                className="text-xl font-bold"
                style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
              >
                {editMode ? '✏️ Edit Quest' : '⚔️ New Quest'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#5C5A7A' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1E1E35'
                  e.currentTarget.style.color = '#F1F0FF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#5C5A7A'
                }}
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
                <label className="block text-sm mb-1.5 font-medium" style={{ color: '#9B99B8' }}>
                  Quest Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Morning Workout, Read 20 Pages"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm transition-colors"
                  style={{
                    background: '#0F0F1A',
                    border: '1px solid #1E1E35',
                    color: '#F1F0FF',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E35')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm mb-1.5 font-medium" style={{ color: '#9B99B8' }}>
                  Description <span style={{ color: '#5C5A7A' }}>(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="What does completing this look like?"
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none transition-colors"
                  style={{
                    background: '#0F0F1A',
                    border: '1px solid #1E1E35',
                    color: '#F1F0FF',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#1E1E35')}
                />
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#9B99B8' }}>
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = category === cat.key
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className="p-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-150 text-center"
                        style={{
                          background: active ? `${cat.color}22` : '#0F0F1A',
                          border: `1px solid ${active ? cat.color : '#1E1E35'}`,
                          boxShadow: active ? `0 0 12px ${cat.color}33` : 'none',
                        }}
                      >
                        <span className="text-xl">{cat.icon}</span>
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
                <label className="block text-sm mb-2 font-medium" style={{ color: '#9B99B8' }}>
                  Difficulty — <span style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}>⚡ {currentXP} XP reward</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {DIFFICULTIES.map((d) => {
                    const active = difficulty === d.key
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDifficulty(d.key)}
                        className="py-2.5 px-1 rounded-xl text-xs font-semibold transition-all duration-150 text-center"
                        style={{
                          background: active ? '#7C3AED' : '#0F0F1A',
                          color: active ? '#F1F0FF' : '#9B99B8',
                          border: `1px solid ${active ? '#7C3AED' : '#1E1E35'}`,
                          boxShadow: active ? '0 0 12px #7C3AED44' : 'none',
                          fontFamily: 'Oxanium, sans-serif',
                        }}
                      >
                        <div>{d.label}</div>
                        <div style={{ color: active ? '#C4A8FF' : '#5C5A7A' }}>+{d.xp} XP</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#9B99B8' }}>
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

              {/* Emoji Picker */}
              <div>
                <label className="block text-sm mb-2 font-medium" style={{ color: '#9B99B8' }}>
                  Quest Icon
                </label>
                <div className="grid grid-cols-10 gap-1.5 p-3 rounded-xl" style={{ background: '#0F0F1A', border: '1px solid #1E1E35' }}>
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className="aspect-square rounded-lg flex items-center justify-center text-lg transition-all"
                      style={{
                        background: emoji === e ? '#7C3AED33' : 'transparent',
                        border: `1px solid ${emoji === e ? '#7C3AED' : 'transparent'}`,
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
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
                className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
                style={{ background: '#1E1E35', color: '#9B99B8' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: '#7C3AED',
                  color: '#F1F0FF',
                  boxShadow: '0 0 15px #7C3AED44',
                  fontFamily: 'Oxanium, sans-serif',
                }}
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
