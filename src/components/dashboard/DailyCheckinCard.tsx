'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Heart, Zap, CheckCircle2, Frown, Meh, Smile, Laugh } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const MOOD_OPTIONS = [
  { score: 1, icon: Frown, label: 'Rough', color: '#EF4444' },
  { score: 2, icon: Meh, label: 'Meh', color: '#F59E0B' },
  { score: 3, icon: Smile, label: 'Good', color: '#3B82F6' },
  { score: 4, icon: Laugh, label: 'Great', color: '#8B5CF6' },
  { score: 5, icon: Flame, label: 'On Fire', color: '#EC4899' },
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
      toast.success('Daily check-in logged!')
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
    const MoodIcon = MOOD_OPTIONS.find((m) => m.score === todaysCheckin.mood_score)?.icon ?? Smile
    const moodColor = MOOD_OPTIONS.find((m) => m.score === todaysCheckin.mood_score)?.color ?? '#3B82F6'
    return (
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl border bg-white shadow-sm"
        style={{
          borderColor: '#EAE6DD',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span className="text-[#6E6A61] font-medium">Daily status logged</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-md" style={{ color: moodColor, backgroundColor: `${moodColor}15` }}>
            <MoodIcon size={14} /> {todaysCheckin.mood_score}/5
          </span>
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md text-[#D97706] bg-[#FEF3C7]">
            <Flame size={12} /> {todaysCheckin.energy_score}/10
          </span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border bg-white shadow-sm"
      style={{
        borderColor: '#EAE6DD',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-7 h-7 rounded-lg bg-[#EDECFD] text-[#5B57F0] flex items-center justify-center">
          <Zap size={15} />
        </div>
        <p className="text-xs font-bold text-[#232019] tracking-wide">Quick Daily Status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mood */}
        <div>
          <p className="text-[11px] font-semibold text-[#6E6A61] mb-2 flex items-center gap-1">
            <Heart size={11} className="text-pink-500" /> Mood
          </p>
          <div className="flex gap-1.5">
            {MOOD_OPTIONS.map((m) => {
              const IconComp = m.icon
              return (
                <button
                  key={m.score}
                  type="button"
                  onClick={() => setSelectedMood(m.score)}
                  title={m.label}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center transition-all ${
                    selectedMood === m.score
                      ? 'bg-[#EDECFD] border-2 border-[#5B57F0] scale-105 shadow-sm'
                      : 'bg-[#FAF8F5] border border-[#EAE6DD] opacity-70 hover:opacity-100'
                  }`}
                  style={{ color: m.color }}
                >
                  <IconComp size={16} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Energy */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="font-semibold text-[#6E6A61] flex items-center gap-1">
              <Flame size={11} className="text-amber-500" /> Energy Level
            </span>
            <span className="font-bold text-[#D97706]">{energyLevel}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
            className="w-full accent-[#5B57F0] cursor-pointer mt-1"
          />
        </div>
      </div>

      <button
        onClick={handleLog}
        disabled={saving}
        className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5B57F0] hover:bg-[#4F46E5] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
      >
        <Zap size={13} />
        <span>{saving ? 'Saving...' : 'Save Daily Status'}</span>
      </button>
    </motion.div>
  )
}
