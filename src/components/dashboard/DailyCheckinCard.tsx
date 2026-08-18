'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Heart, Zap, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const MOOD_OPTIONS = [
  { score: 1, emoji: '😔', label: 'Rough' },
  { score: 2, emoji: '😐', label: 'Meh' },
  { score: 3, emoji: '🙂', label: 'Good' },
  { score: 4, emoji: '😊', label: 'Great' },
  { score: 5, emoji: '🔥', label: 'On Fire' },
]

interface DailyCheckin {
  checkin_date: string
  mood_score: number
  energy_score: number
}

interface DailyCheckinCardProps {
  userId: string
}

export function DailyCheckinCard({ userId }: DailyCheckinCardProps) {
  const [todaysCheckin, setTodaysCheckin] = useState<DailyCheckin | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState<number>(4)
  const [energyLevel, setEnergyLevel] = useState<number>(7)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function load() {
      if (!userId) return
      try {
        const { data } = await supabase
          .from('daily_checkins')
          .select('*')
          .eq('user_id', userId)
          .eq('checkin_date', today)
          .maybeSingle()
        setTodaysCheckin(data as DailyCheckin | null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId, supabase, today])

  async function handleLog() {
    setSaving(true)
    try {
      const { error } = await supabase.from('daily_checkins').upsert({
        user_id: userId,
        checkin_date: today,
        mood_score: selectedMood,
        energy_score: energyLevel,
      })
      if (error) throw error

      setTodaysCheckin({ checkin_date: today, mood_score: selectedMood, energy_score: energyLevel })
      toast.success('Daily check-in logged! ⚡')
    } catch (err) {
      console.error('Check-in error:', err)
      toast.error('Failed to save check-in')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  // Already checked in today — show compact badge
  if (todaysCheckin) {
    const moodEmoji = MOOD_OPTIONS.find((m) => m.score === todaysCheckin.mood_score)?.emoji ?? '🙂'
    return (
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-800 bg-[#13131F] mb-4"
        style={{ maxWidth: 400 }}
      >
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 size={14} className="text-green-400" />
          <span className="text-slate-400">Today&apos;s status logged</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-bold text-pink-400">
            {moodEmoji} {todaysCheckin.mood_score}/5
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
            <Flame size={11} /> {todaysCheckin.energy_score}/10
          </span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl border border-purple-500/30 bg-[#13131F] mb-6 shadow-lg shadow-purple-950/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
          <Zap size={15} />
        </div>
        <p className="text-xs font-bold text-white font-display tracking-wide">Quick Check-in</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mood */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Heart size={11} className="text-pink-400" /> Mood
          </p>
          <div className="flex gap-1.5">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.score}
                type="button"
                onClick={() => setSelectedMood(m.score)}
                title={m.label}
                className={`flex-1 py-1.5 rounded-lg text-sm text-center transition-all ${
                  selectedMood === m.score
                    ? 'bg-purple-500/25 border-2 border-purple-500 scale-110'
                    : 'bg-slate-900 border border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Flame size={11} className="text-amber-400" /> Energy
            </span>
            <span className="font-bold text-amber-400 font-display">{energyLevel}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer mt-1"
          />
        </div>
      </div>

      <button
        onClick={handleLog}
        disabled={saving}
        className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors font-display flex items-center justify-center gap-1.5"
      >
        <Zap size={13} />
        <span>{saving ? 'Logging...' : 'Log Status'}</span>
      </button>
    </motion.div>
  )
}
