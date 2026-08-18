'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Check, X, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface MicroReflectionProps {
  habitId: string
  habitName: string
  isOpen: boolean
  onClose: () => void
}

const MOODS = [
  { score: 1, emoji: '😔', label: 'Tough' },
  { score: 2, emoji: '😐', label: 'Okay' },
  { score: 3, emoji: '🙂', label: 'Good' },
  { score: 4, emoji: '😊', label: 'Great' },
  { score: 5, emoji: '🔥', label: 'Unstoppable' },
]

export function MicroReflectionModal({
  habitId,
  habitName,
  isOpen,
  onClose,
}: MicroReflectionProps) {
  const [rating, setRating] = useState<number>(5)
  const [selectedMood, setSelectedMood] = useState<number>(4)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleSave() {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('journal_entries').insert({
          user_id: user.id,
          entry_type: 'quest_reflection',
          habit_id: habitId,
          mood_score: selectedMood * 2, // scale 1-10
          content: note.trim() ? `[${habitName}] Rating: ${rating}/5. ${note.trim()}` : `[${habitName}] Completed with rating ${rating}/5.`,
          tags: ['reflection', 'quest'],
        })
      }
      toast.success('Reflection logged in Journal! 📝')
      onClose()
    } catch (err) {
      console.error('Error saving reflection:', err)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-purple-500/40 bg-[#13131F] p-4 shadow-2xl shadow-purple-950/60"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 font-display">
              <Sparkles size={14} />
              <span>Quick Reflection (15s)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-xs font-semibold text-white truncate mb-2">
            How was <span className="text-amber-400">&ldquo;{habitName}&rdquo;</span>?
          </p>

          {/* Star rating */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={18}
                  className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
                />
              </button>
            ))}
            <span className="text-[11px] text-slate-400 ml-2 font-display">{rating}/5</span>
          </div>

          {/* Mood emoji selection */}
          <div className="flex justify-between gap-1 mb-3">
            {MOODS.map((m) => (
              <button
                key={m.score}
                type="button"
                onClick={() => setSelectedMood(m.score)}
                className={`flex-1 py-1.5 rounded-lg text-sm transition-all text-center ${
                  selectedMood === m.score
                    ? 'bg-purple-500/20 border border-purple-500 scale-105'
                    : 'bg-slate-900 border border-slate-800 opacity-70'
                }`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>

          {/* Optional one line thought */}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Quick thought / note (optional)"
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-[#0F0F1A] border border-slate-800 text-white outline-none focus:border-purple-500 mb-3"
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 flex items-center justify-center gap-1 font-display"
            >
              <Check size={13} />
              <span>Save ✓</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
