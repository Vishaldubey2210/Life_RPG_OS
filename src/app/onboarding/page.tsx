'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2 } from 'lucide-react'

const AVATARS = ['⚔️', '🧙', '🏹', '🛡️', '🔮', '🦅', '🐉', '👑', '🌟', '🔥', '💎', '🌙']

type GoalId = 'strong' | 'mind' | 'peace' | 'wealth' | 'health' | 'social'

const GOALS: { id: GoalId; emoji: string; label: string }[] = [
  { id: 'strong', emoji: '💪', label: 'Get Physically Strong' },
  { id: 'mind', emoji: '🧠', label: 'Level Up My Mind' },
  { id: 'peace', emoji: '🧘', label: 'Find Inner Peace' },
  { id: 'wealth', emoji: '💰', label: 'Build My Wealth' },
  { id: 'health', emoji: '❤️', label: 'Improve My Health' },
  { id: 'social', emoji: '🗣️', label: 'Master Social Skills' },
]

const HABIT_MAP: Record<GoalId, { name: string; difficulty: string; xp: number; stat: string; emoji: string }[]> = {
  strong: [
    { name: 'Morning Workout', difficulty: 'Hard', xp: 50, stat: 'STR', emoji: '🏋️' },
    { name: 'Evening Walk', difficulty: 'Easy', xp: 10, stat: 'STR', emoji: '🚶' },
  ],
  mind: [
    { name: 'Read 20 Pages', difficulty: 'Medium', xp: 25, stat: 'INT', emoji: '📚' },
    { name: 'Learn Something New', difficulty: 'Medium', xp: 25, stat: 'INT', emoji: '💡' },
  ],
  peace: [
    { name: '10min Meditation', difficulty: 'Easy', xp: 10, stat: 'WIS', emoji: '🧘' },
    { name: 'Gratitude Journal', difficulty: 'Easy', xp: 10, stat: 'WIS', emoji: '📓' },
  ],
  wealth: [
    { name: 'Track Expenses', difficulty: 'Easy', xp: 10, stat: 'GOLD', emoji: '💰' },
    { name: 'Save ₹X Today', difficulty: 'Medium', xp: 25, stat: 'GOLD', emoji: '🏦' },
  ],
  health: [
    { name: 'Sleep by 11pm', difficulty: 'Medium', xp: 25, stat: 'VIT', emoji: '😴' },
    { name: 'Drink 3L Water', difficulty: 'Easy', xp: 10, stat: 'VIT', emoji: '💧' },
  ],
  social: [
    { name: 'Call a Friend', difficulty: 'Medium', xp: 25, stat: 'CHA', emoji: '📞' },
    { name: 'Meet Someone New', difficulty: 'Hard', xp: 50, stat: 'CHA', emoji: '🤝' },
  ],
}

type Habit = {
  name: string
  difficulty: string
  xp: number
  stat: string
  emoji: string
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#22C55E',
  Medium: '#3B82F6',
  Hard: '#7C3AED',
  Legendary: '#F59E0B',
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('⚔️')
  const [selectedGoals, setSelectedGoals] = useState<GoalId[]>([])
  const [selectedHabits, setSelectedHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)

  const allGeneratedHabits: Habit[] = selectedGoals.flatMap((g) => HABIT_MAP[g])

  function goNext() {
    setDirection(1)
    setStep((s) => s + 1)
  }
  function goPrev() {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  function toggleGoal(id: GoalId) {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  function toggleHabit(habit: Habit) {
    setSelectedHabits((prev) => {
      const exists = prev.some((h) => h.name === habit.name)
      if (exists) return prev.filter((h) => h.name !== habit.name)
      return [...prev, habit]
    })
    // Auto-select on step 2 → 3 transition
  }

  // Ensure habits are auto-selected when moving to step 3
  function handleGoalsDone() {
    setSelectedHabits(allGeneratedHabits)
    goNext()
  }

  const totalDailyXP = selectedHabits.reduce((sum, h) => sum + h.xp, 0)

  async function handleBeginQuest() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName || 'Adventurer',
        avatar_emoji: selectedAvatar,
        onboarding_completed: true,
        level: 1,
        xp: 0,
        hp: 100,
        hp_max: 100,
        xp_to_next: 100,
        streak: 0,
      })

      // Insert habits
      if (selectedHabits.length > 0) {
        await supabase.from('habits').insert(
          selectedHabits.map((h) => ({
            user_id: user.id,
            name: h.name,
            difficulty: h.difficulty.toLowerCase(),
            xp_reward: h.xp,
            stat_category: h.stat.toLowerCase(),
            emoji: h.emoji,
            is_active: true,
          }))
        )
      }

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#08080F' }}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ background: '#1E1E35' }}>
        <motion.div
          className="h-full"
          style={{ background: '#7C3AED' }}
          initial={{ width: '0%' }}
          animate={{ width: `${((step + 1) / 4) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Step indicator */}
      <div className="fixed top-4 right-6 text-sm" style={{ color: '#5C5A7A' }}>
        {step + 1} / 4
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-16">
        <AnimatePresence custom={direction} mode="wait">
          {/* STEP 1 */}
          {step === 0 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}>
                Create Your Character
              </h2>
              <p className="mb-10" style={{ color: '#9B99B8' }}>Who are you, Adventurer?</p>

              {/* Avatar picker */}
              <div className="mb-8">
                <p className="text-sm mb-4" style={{ color: '#5C5A7A' }}>Choose your avatar</p>
                <div className="grid grid-cols-6 gap-3 max-w-sm mx-auto">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      className="text-3xl p-2 rounded-xl transition-all duration-200"
                      style={{
                        background: selectedAvatar === av ? '#7C3AED22' : '#13131F',
                        border: selectedAvatar === av ? '2px solid #7C3AED' : '2px solid #1E1E35',
                        transform: selectedAvatar === av ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
                {/* Preview */}
                <div className="mt-6 text-6xl">{selectedAvatar}</div>
              </div>

              {/* Name input */}
              <div className="max-w-sm mx-auto mb-8">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full text-center text-xl px-6 py-4 rounded-xl outline-none"
                  style={{
                    background: '#13131F',
                    border: '1px solid #2E2E50',
                    color: '#F1F0FF',
                    fontFamily: 'Oxanium, sans-serif',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                  onBlur={(e) => (e.target.style.borderColor = '#2E2E50')}
                />
              </div>

              <button
                onClick={goNext}
                disabled={!displayName.trim()}
                className="px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
                style={{
                  background: displayName.trim() ? '#7C3AED' : '#2E2E50',
                  color: '#F1F0FF',
                  cursor: displayName.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'Oxanium, sans-serif',
                }}
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}>
                  Choose Your Path
                </h2>
                <p style={{ color: '#9B99B8' }}>Choose what you want to max out (pick at least one)</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {GOALS.map((goal) => {
                  const selected = selectedGoals.includes(goal.id)
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className="p-5 rounded-xl text-left transition-all duration-200 card-glow"
                      style={{
                        background: selected ? '#7C3AED22' : '#13131F',
                        border: selected ? '2px solid #7C3AED' : '2px solid #1E1E35',
                      }}
                    >
                      <div className="text-3xl mb-2">{goal.emoji}</div>
                      <div className="font-medium" style={{ color: '#F1F0FF' }}>{goal.label}</div>
                      {selected && (
                        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: '#7C3AED' }}>
                          <Check size={12} /> Selected
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={goPrev} className="px-6 py-3 rounded-xl font-medium" style={{ background: '#1E1E35', color: '#9B99B8' }}>
                  ← Back
                </button>
                <button
                  onClick={handleGoalsDone}
                  disabled={selectedGoals.length === 0}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{
                    background: selectedGoals.length > 0 ? '#7C3AED' : '#2E2E50',
                    color: '#F1F0FF',
                    cursor: selectedGoals.length > 0 ? 'pointer' : 'not-allowed',
                    fontFamily: 'Oxanium, sans-serif',
                  }}
                >
                  My Starter Quests →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}>
                  Your Starter Quests
                </h2>
                <p style={{ color: '#9B99B8' }}>Deselect any habits you don&apos;t want</p>
              </div>

              <div className="space-y-3 mb-6">
                {allGeneratedHabits.map((habit) => {
                  const isSelected = selectedHabits.some((h) => h.name === habit.name)
                  return (
                    <button
                      key={habit.name}
                      onClick={() => toggleHabit(habit)}
                      className="w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-200 text-left"
                      style={{
                        background: isSelected ? '#13131F' : '#0F0F1A',
                        border: isSelected ? '1px solid #2E2E50' : '1px solid transparent',
                        opacity: isSelected ? 1 : 0.5,
                      }}
                    >
                      <div className="text-2xl">{habit.emoji}</div>
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: '#F1F0FF', textDecoration: isSelected ? 'none' : 'line-through' }}>
                          {habit.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: DIFFICULTY_COLORS[habit.difficulty] + '33', color: DIFFICULTY_COLORS[habit.difficulty] }}>
                            {habit.difficulty}
                          </span>
                          <span className="text-xs" style={{ color: '#9B99B8' }}>+{habit.xp} XP</span>
                          <span className="text-xs" style={{ color: '#5C5A7A' }}>{habit.stat}</span>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: isSelected ? '#7C3AED' : '#1E1E35' }}>
                        {isSelected && <Check size={12} color="#fff" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Total XP */}
              <div className="p-4 rounded-xl mb-6 text-center" style={{ background: '#13131F', border: '1px solid #2E2E50' }}>
                <span style={{ color: '#9B99B8' }}>Daily XP Potential: </span>
                <span className="text-xl font-bold" style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}>
                  ⚡ {totalDailyXP} XP
                </span>
              </div>

              <div className="flex gap-3">
                <button onClick={goPrev} className="px-6 py-3 rounded-xl font-medium" style={{ background: '#1E1E35', color: '#9B99B8' }}>
                  ← Back
                </button>
                <button
                  onClick={goNext}
                  disabled={selectedHabits.length === 0}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{
                    background: selectedHabits.length > 0 ? '#7C3AED' : '#2E2E50',
                    color: '#F1F0FF',
                    fontFamily: 'Oxanium, sans-serif',
                  }}
                >
                  Preview Character →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}>
                You&apos;re Ready, {displayName}!
              </h2>
              <p className="mb-8" style={{ color: '#9B99B8' }}>Your character has been forged. The quest begins.</p>

              {/* Character card */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="max-w-xs mx-auto mb-8 p-6 rounded-2xl"
                style={{
                  background: '#13131F',
                  border: '2px solid #7C3AED66',
                  boxShadow: '0 0 30px #7C3AED22',
                }}
              >
                <div className="text-6xl mb-3">{selectedAvatar}</div>
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}>
                  {displayName}
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4" style={{ background: '#F59E0B22', color: '#F59E0B' }}>
                  Level 1
                </div>
                {/* XP bar */}
                <div className="text-xs mb-1 text-right" style={{ color: '#9B99B8' }}>0 / 100 XP</div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                  <div className="h-full w-0 rounded-full" style={{ background: '#7C3AED' }} />
                </div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: '💪 STR', val: 1 },
                    { label: '🧠 INT', val: 1 },
                    { label: '🧘 WIS', val: 1 },
                    { label: '❤️ VIT', val: 1 },
                    { label: '💰 GOLD', val: 1 },
                    { label: '🗣️ CHA', val: 1 },
                  ].map((s) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-center p-2 rounded-lg"
                      style={{ background: '#0F0F1A' }}
                    >
                      <div className="text-xs" style={{ color: '#5C5A7A' }}>{s.label}</div>
                      <div className="font-bold" style={{ fontFamily: 'Oxanium, sans-serif', color: '#7C3AED' }}>{s.val}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="flex gap-3 max-w-xs mx-auto">
                <button onClick={goPrev} className="px-4 py-3 rounded-xl font-medium" style={{ background: '#1E1E35', color: '#9B99B8' }}>
                  ← Back
                </button>
                <button
                  id="begin-quest-btn"
                  onClick={handleBeginQuest}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: '#7C3AED',
                    color: '#F1F0FF',
                    fontFamily: 'Oxanium, sans-serif',
                    boxShadow: '0 0 20px #7C3AED44',
                  }}
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : '⚔️ Begin Your Quest'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
