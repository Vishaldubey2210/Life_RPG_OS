'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  CloudRain,
  Waves,
  Trees,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import Sidebar from '@/components/layout/Sidebar'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'
import { playAmbientSound, stopAmbientSound, AmbientSoundType } from '@/lib/ambientSound'

type SessionPreset = 'pomodoro' | 'sprint' | 'deepwork' | 'custom'

interface PresetConfig {
  name: string
  durationMinutes: number
  breakMinutes: number
  xpReward: number
  icon: string
  label: string
}

const PRESETS: Record<SessionPreset, PresetConfig> = {
  pomodoro: { name: 'Pomodoro', durationMinutes: 25, breakMinutes: 5, xpReward: 25, icon: 'timer', label: '25m Work / 5m Rest' },
  sprint:   { name: 'Sprint',   durationMinutes: 15, breakMinutes: 3, xpReward: 15, icon: 'zap', label: '15m High Intensity' },
  deepwork: { name: 'Deep Work',durationMinutes: 50, breakMinutes: 10,xpReward: 60, icon: 'mountain', label: '50m Deep Flow' },
  custom:   { name: 'Custom',   durationMinutes: 30, breakMinutes: 5, xpReward: 30, icon: 'target', label: 'Custom Target' },
}

export default function FocusPage() {
  const { profile, refetch } = useProfile()
  const [preset, setPreset] = useState<SessionPreset>('pomodoro')
  const [customMinutes, setCustomMinutes] = useState(30)
  const [totalSeconds, setTotalSeconds] = useState(25 * 60)
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [ambient, setAmbient] = useState<AmbientSoundType>('silent')
  const [selectedHabitId, setSelectedHabitId] = useState<string>('')
  const [habits, setHabits] = useState<Array<{ id: string; name: string }>>([])
  const [completedSessionModal, setCompletedSessionModal] = useState<boolean>(false)
  const [earnedXP, setEarnedXP] = useState(25)
  const isNavigatingRef = useRef(false)
  const supabase = createClient()

  // Load user's incomplete habits
  useEffect(() => {
    async function loadHabits() {
      if (!profile?.id) return
      const { data } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', profile.id)
        .eq('is_active', true)
      if (data) setHabits(data)
    }
    loadHabits()
  }, [profile?.id, supabase])

  // Change preset
  useEffect(() => {
    if (!isActive) {
      const mins = preset === 'custom' ? customMinutes : PRESETS[preset].durationMinutes
      setTotalSeconds(mins * 60)
      setSecondsRemaining(mins * 60)
      setEarnedXP(preset === 'custom' ? Math.round(customMinutes) : PRESETS[preset].xpReward)
    }
  }, [preset, customMinutes, isActive])

  // Ambient sound controller
  useEffect(() => {
    if (isActive && ambient !== 'silent') {
      playAmbientSound(ambient)
    } else {
      stopAmbientSound()
    }
    return () => {
      stopAmbientSound()
    }
  }, [isActive, ambient])

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1)
      }, 1000)
    } else if (isActive && secondsRemaining === 0) {
      handleCompleteSession()
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, secondsRemaining])

  async function handleCompleteSession() {
    setIsActive(false)
    stopAmbientSound()

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#F59E0B', '#10B981'],
    })

    const durationDone = Math.round(totalSeconds / 60)
    const reward = earnedXP

    if (profile?.id) {
      // 1. Record session
      await supabase.from('focus_sessions').insert({
        user_id: profile.id,
        habit_id: selectedHabitId || null,
        session_type: preset,
        planned_duration: durationDone,
        actual_duration: durationDone,
        xp_earned: reward,
        completed: true,
      })

      // 2. Award XP to profile
      await supabase.rpc('increment_xp', {
        user_id: profile.id,
        amount: reward,
      })

      refetch?.()
    }

    setCompletedSessionModal(true)
  }

  async function handleMarkQuestDone() {
    if (!selectedHabitId || !profile?.id) return
    try {
      await supabase.from('habit_completions').insert({
        habit_id: selectedHabitId,
        user_id: profile.id,
        completed_at: new Date().toISOString(),
      })
      toast.success('Linked quest marked as complete!')
    } catch {
      toast.error('Could not complete quest')
    }
    setCompletedSessionModal(false)
  }

  const mins = Math.floor(secondsRemaining / 60)
  const secs = secondsRemaining % 60
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const progress = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0
  const radius = 130
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Sidebar />

      <main className="flex-1 md:ml-60 p-4 md:p-8 max-w-4xl mx-auto pb-24 flex flex-col items-center justify-center">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5B57F0] mb-1">
            <Timer size={14} />
            <span>Chrono Chamber • Focus Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#232019] tracking-tight">
            Focus Mode
          </h1>
          <p className="text-sm font-medium text-[#8A857A] mt-1">
            Immerse yourself in deep concentration to accelerate quest completions &amp; earn bonus XP.
          </p>
        </div>

        {/* Deep Work Badge */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 px-4 py-1.5 rounded-full border border-[#D6D3FA] bg-[#EDECFD] text-[#5B57F0] text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Shield size={14} className="text-[#5B57F0]" />
            <span>Deep Work Protocol Engaged • Distractions Blocked</span>
          </motion.div>
        )}

        {/* Linked Habit Selector */}
        <div className="w-full max-w-sm mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8A857A] mb-2 text-center">
            Link Quest to Focus Session (Optional)
          </label>
          <select
            disabled={isActive}
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white border border-[#EAE6DD] text-[#232019] outline-none focus:border-[#5B57F0] disabled:opacity-50 shadow-sm"
          >
            <option value="">-- Standalone Focus Session --</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Presets Selection */}
        {!isActive && (
          <div className="flex gap-2 mb-7 flex-wrap justify-center">
            {(Object.keys(PRESETS) as SessionPreset[]).map((p) => {
              const cfg = PRESETS[p]
              const active = preset === p
              return (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    active
                      ? 'bg-[#EDECFD] text-[#5B57F0] border-[#D6D3FA] shadow-sm'
                      : 'bg-white text-[#6E6A61] border-[#EAE6DD] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <DynamicIcon name={cfg.icon} size={15} />
                  <span>{cfg.name}</span>
                  <span className="text-[10px] opacity-75">({cfg.durationMinutes}m)</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Circular Countdown Ring */}
        <div className="relative w-80 h-80 flex items-center justify-center my-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            {/* Background Ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="#EAE6DD"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={isActive ? '#5B57F0' : '#8A857A'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
                filter: isActive ? 'drop-shadow(0 0 8px rgba(91,87,240,0.4))' : 'none',
              }}
            />
          </svg>

          {/* Time Display Inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-6xl font-black tracking-tight text-[#232019]"
            >
              {formattedTime}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B57F0] mt-2 flex items-center gap-1 bg-[#EDECFD] px-3 py-1 rounded-full">
              <Zap size={12} /> +{earnedXP} XP on completion
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => {
              const mins = preset === 'custom' ? customMinutes : PRESETS[preset].durationMinutes
              setSecondsRemaining(mins * 60)
              setIsActive(false)
            }}
            className="p-3.5 rounded-2xl bg-white border border-[#EAE6DD] text-[#8A857A] hover:text-[#232019] transition-colors shadow-sm"
            title="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="px-8 py-4 rounded-2xl font-extrabold text-base flex items-center gap-3 transition-all bg-[#5B57F0] hover:bg-[#4F46E5] text-white shadow-lg shadow-purple-500/25 hover:scale-105"
          >
            {isActive ? (
              <>
                <Pause size={20} />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>Begin Flow</span>
              </>
            )}
          </button>
        </div>

        {/* Ambient Sound Audio Selector */}
        <div className="flex items-center gap-2 mt-8 flex-wrap justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8A857A] mr-1 flex items-center gap-1">
            <Volume2 size={13} /> Ambient:
          </span>
          {[
            { key: 'silent', label: 'Mute', icon: VolumeX },
            { key: 'rain', label: 'Rain', icon: CloudRain },
            { key: 'waves', label: 'Ocean', icon: Waves },
            { key: 'forest', label: 'Forest', icon: Trees },
          ].map((snd) => {
            const SndIcon = snd.icon
            const isSel = ambient === snd.key
            return (
              <button
                key={snd.key}
                onClick={() => setAmbient(snd.key as AmbientSoundType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  isSel
                    ? 'bg-[#ECFDF5] text-emerald-700 border-[#A7F3D0] shadow-sm'
                    : 'bg-white text-[#6E6A61] border-[#EAE6DD] hover:bg-[#FAF8F5]'
                }`}
              >
                <SndIcon size={13} />
                <span>{snd.label}</span>
              </button>
            )
          })}
        </div>

        {/* Completion Modal */}
        <AnimatePresence>
          {completedSessionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md rounded-2xl border border-[#EAE6DD] bg-white p-6 text-center shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#EDECFD] text-[#5B57F0] border border-[#D6D3FA] flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} />
                </div>

                <h3 className="text-2xl font-extrabold text-[#232019] font-display">
                  Focus Session Complete!
                </h3>
                <p className="text-sm text-[#6E6A61] mt-1 mb-4">
                  You conquered <span className="text-[#5B57F0] font-bold">{Math.round(totalSeconds / 60)} minutes</span> of distraction-free flow.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold font-display text-base mb-6">
                  <Zap size={18} /> +{earnedXP} XP Earned
                </div>

                <div className="space-y-3">
                  {selectedHabitId && (
                    <button
                      onClick={handleMarkQuestDone}
                      className="w-full py-3 rounded-xl font-bold bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center gap-2 font-display transition-colors shadow-sm"
                    >
                      <CheckCircle2 size={16} />
                      <span>Mark Linked Quest as Completed</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCompletedSessionModal(false)}
                    className="w-full py-3 rounded-xl font-semibold bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#EAE6DD] text-[#232019] transition-colors"
                  >
                    Close & Keep Grinding
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

