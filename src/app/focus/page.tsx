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
  pomodoro: { name: 'Pomodoro', durationMinutes: 25, breakMinutes: 5, xpReward: 25, icon: '🍅', label: '25m Work / 5m Rest' },
  sprint:   { name: 'Sprint',   durationMinutes: 15, breakMinutes: 3, xpReward: 15, icon: '⚡', label: '15m High Intensity' },
  deepwork: { name: 'Deep Work',durationMinutes: 50, breakMinutes: 10,xpReward: 60, icon: '🏔️', label: '50m Deep Flow' },
  custom:   { name: 'Custom',   durationMinutes: 30, breakMinutes: 5, xpReward: 30, icon: '🎯', label: 'Custom Target' },
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
      toast.success('Linked quest marked as complete! 🎯')
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
    <div className={`flex min-h-screen transition-colors duration-500 ${isActive ? 'bg-[#040408]' : 'bg-[#08080F]'}`}>
      <Sidebar />

      <main className="flex-1 md:ml-60 p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[90vh]">
        {/* Distraction Dimmer Banner */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border border-purple-500/30 bg-[#13131F]/90 backdrop-blur-md flex items-center gap-2 text-xs font-bold text-purple-300 font-display shadow-xl shadow-purple-950/60"
          >
            <Shield size={14} className="text-purple-400" />
            <span>Deep Work Protocol Engaged • Distractions Blocked</span>
          </motion.div>
        )}

        {/* Quest Linking Select */}
        <div className="w-full max-w-md mb-6">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Layers size={13} className="text-purple-400" />
            <span>Focus Target Quest (Optional)</span>
          </label>
          <select
            disabled={isActive}
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#13131F] border border-slate-800 text-white outline-none focus:border-purple-500 disabled:opacity-50"
          >
            <option value="">-- Standalone Focus Session --</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                ⚔️ {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Presets Selection */}
        {!isActive && (
          <div className="flex gap-2 mb-8 flex-wrap justify-center">
            {(Object.keys(PRESETS) as SessionPreset[]).map((p) => {
              const cfg = PRESETS[p]
              const active = preset === p
              return (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all font-display flex items-center gap-2 ${
                    active
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 border border-purple-400'
                      : 'bg-[#13131F] text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.name}</span>
                  <span className="text-[10px] opacity-80">({cfg.durationMinutes}m)</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Circular Countdown Ring */}
        <div className="relative w-80 h-80 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            {/* Background Ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="#1E1E35"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={isActive ? '#7C3AED' : '#5C5A7A'}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
                filter: isActive ? 'drop-shadow(0 0 12px rgba(124,58,237,0.7))' : 'none',
              }}
            />
          </svg>

          {/* Time Display Inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-6xl font-black tracking-tight text-white font-display"
              style={{ textShadow: isActive ? '0 0 25px rgba(124,58,237,0.5)' : 'none' }}
            >
              {formattedTime}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-display mt-2 flex items-center gap-1">
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
            className="p-3.5 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="px-8 py-4 rounded-2xl font-extrabold text-base flex items-center gap-3 transition-all font-display bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-900/50 hover:scale-105"
          >
            {isActive ? (
              <>
                <Pause size={20} /> Pause Flow
              </>
            ) : (
              <>
                <Play size={20} className="fill-white" /> Start Focus ⚔️
              </>
            )}
          </button>
        </div>

        {/* Ambient Sound Selector */}
        <div className="mt-8 p-3 rounded-2xl border border-slate-800 bg-[#13131F] flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 px-2 font-display">
            Ambient Sound:
          </span>
          {[
            { key: 'silent', label: 'Off', icon: VolumeX },
            { key: 'rain', label: 'Rain', icon: CloudRain },
            { key: 'ocean', label: 'Ocean Waves', icon: Waves },
            { key: 'forest', label: 'Forest Wind', icon: Trees },
          ].map((snd) => {
            const active = ambient === snd.key
            const Icon = snd.icon
            return (
              <button
                key={snd.key}
                onClick={() => setAmbient(snd.key as AmbientSoundType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={13} />
                <span>{snd.label}</span>
              </button>
            )
          })}
        </div>

        {/* Completion Modal */}
        <AnimatePresence>
          {completedSessionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#13131F] p-6 text-center shadow-2xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} />
                </div>

                <h3 className="text-2xl font-extrabold text-white font-display">
                  Focus Session Complete!
                </h3>
                <p className="text-sm text-slate-300 mt-1 mb-4">
                  You conquered <span className="text-purple-400 font-bold">{Math.round(totalSeconds / 60)} minutes</span> of distraction-free flow.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold font-display text-base mb-6">
                  <Zap size={18} /> +{earnedXP} XP Earned
                </div>

                <div className="space-y-3">
                  {selectedHabitId && (
                    <button
                      onClick={handleMarkQuestDone}
                      className="w-full py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white flex items-center justify-center gap-2 font-display transition-colors"
                    >
                      <CheckCircle2 size={16} />
                      <span>Mark Linked Quest as Completed</span>
                    </button>
                  )}

                  <button
                    onClick={() => setCompletedSessionModal(false)}
                    className="w-full py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
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
