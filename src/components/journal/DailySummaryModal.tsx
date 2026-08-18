'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, X, Send, Heart, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface DailySummaryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DailySummaryModal({ isOpen, onClose }: DailySummaryModalProps) {
  const [winText, setWinText] = useState('')
  const [improveText, setImproveText] = useState('')
  const [moodScore, setMoodScore] = useState(8)
  const [energyScore, setEnergyScore] = useState(8)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const content = `Biggest Win: ${winText.trim() || 'Crushed all daily quests.'}\nTomorrow Focus: ${improveText.trim() || 'Maintain consistency and push deeper.'}`

      await supabase.from('journal_entries').insert({
        user_id: user.id,
        entry_type: 'daily_summary',
        content,
        mood_score: moodScore,
        energy_score: energyScore,
        tags: ['daily_summary', 'perfect_day'],
      })

      // Also update daily checkin
      await supabase.from('daily_checkins').upsert({
        user_id: user.id,
        checkin_date: new Date().toISOString().split('T')[0],
        mood_score: Math.ceil(moodScore / 2),
        energy_score: energyScore,
        notes: winText.trim(),
      })

      toast.success('Daily Summary saved! +50 Journal XP 📝')
      onClose()
    } catch (err) {
      console.error('Error saving daily summary:', err)
      toast.error('Failed to save summary')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg rounded-2xl border border-purple-500/30 bg-[#13131F] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Daily Summary (30s)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Seal today&apos;s victories and calibrate for tomorrow
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Today&apos;s Biggest Win 🏆
                </label>
                <input
                  type="text"
                  required
                  value={winText}
                  onChange={(e) => setWinText(e.target.value)}
                  placeholder="e.g. Finished difficult deep work sprint before lunch"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0F0F1A] border border-slate-800 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tomorrow I Will Improve 🎯
                </label>
                <input
                  type="text"
                  required
                  value={improveText}
                  onChange={(e) => setImproveText(e.target.value)}
                  placeholder="e.g. Start morning workout 15 minutes earlier"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0F0F1A] border border-slate-800 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Heart size={12} className="text-pink-400" /> Mood Score
                    </span>
                    <span className="text-pink-400 font-bold font-display">{moodScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={moodScore}
                    onChange={(e) => setMoodScore(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Flame size={12} className="text-amber-400" /> Energy Level
                    </span>
                    <span className="text-amber-400 font-bold font-display">{energyScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={energyScore}
                    onChange={(e) => setEnergyScore(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-400 hover:text-white"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 font-display"
                >
                  <Send size={15} />
                  <span>{saving ? 'Saving...' : 'Save Summary'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
