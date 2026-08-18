'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Question {
  id: string
  text: string
  options: { label: string; value: string; emoji: string }[]
}

const QUESTIONS: Question[] = [
  {
    id: 'morning_type',
    text: 'Which best describes your morning?',
    options: [
      { label: 'Early riser', value: 'early_bird', emoji: '🌅' },
      { label: 'Night owl', value: 'night_owl', emoji: '🦉' },
      { label: 'Flexible', value: 'flexible', emoji: '⚡' },
      { label: 'Total chaos', value: 'chaotic', emoji: '🌪️' },
    ],
  },
  {
    id: 'motivation_style',
    text: 'What keeps you going when things get hard?',
    options: [
      { label: 'Discipline & Systems', value: 'discipline', emoji: '🏋️' },
      { label: 'Community & Accountability', value: 'social', emoji: '🤝' },
      { label: 'Progress & Rewards', value: 'rewards', emoji: '🏆' },
      { label: 'Purpose & Meaning', value: 'purpose', emoji: '🎯' },
    ],
  },
  {
    id: 'biggest_challenge',
    text: 'Your biggest habit-building challenge?',
    options: [
      { label: 'Starting consistently', value: 'consistency', emoji: '📅' },
      { label: 'Not giving up', value: 'persistence', emoji: '🔥' },
      { label: 'Finding time', value: 'time', emoji: '⏳' },
      { label: 'Staying motivated', value: 'motivation', emoji: '💡' },
    ],
  },
  {
    id: 'work_style',
    text: 'How do you prefer to work?',
    options: [
      { label: 'Deep focus blocks', value: 'deep_work', emoji: '🎯' },
      { label: 'Lots of small tasks', value: 'sprints', emoji: '⚡' },
      { label: 'Flexible & spontaneous', value: 'flexible', emoji: '🌊' },
      { label: 'Structured routine', value: 'structured', emoji: '📋' },
    ],
  },
  {
    id: 'goal_timeline',
    text: 'Your primary goal horizon?',
    options: [
      { label: 'This week', value: 'weekly', emoji: '📆' },
      { label: 'This month', value: 'monthly', emoji: '📅' },
      { label: 'This year', value: 'yearly', emoji: '🗓️' },
      { label: 'Life-long journey', value: 'lifelong', emoji: '♾️' },
    ],
  },
]

// Derive archetype from answers
function deriveArchetype(answers: Record<string, string>): { archetype: string; description: string; suggestions: string[] } {
  const { motivation_style, work_style } = answers

  if (motivation_style === 'discipline' && work_style === 'deep_work') {
    return {
      archetype: 'The Monk',
      description: 'You thrive in structured silence. Deep focus is your weapon. You build habits through iron discipline, not motivation.',
      suggestions: ['Add Pomodoro sessions to your Focus page', 'Set a fixed 6am daily ritual quest', 'Disable social features when in Deep Work mode'],
    }
  }
  if (motivation_style === 'social') {
    return {
      archetype: 'The Guild Leader',
      description: 'You rise when others depend on you. Accountability is your superpower. You need witnesses to your progress.',
      suggestions: ['Join a Party and compete on leaderboards', 'Use Shadow Clone Mode daily', 'Share weekly reports with your party'],
    }
  }
  if (motivation_style === 'rewards') {
    return {
      archetype: 'The Champion',
      description: 'XP, streaks, and leaderboards fuel you. You\'re a natural competitor who gamification was built for.',
      suggestions: ['Chase Daily Challenges for bonus XP', 'Participate in Party Boss Battles', 'Unlock all achievement badges'],
    }
  }
  if (motivation_style === 'purpose') {
    return {
      archetype: 'The Sage',
      description: 'You\'re driven by vision and meaning. You need to connect daily actions to a larger purpose to stay committed.',
      suggestions: ['Write your "why" in every quest description', 'Use daily journal reflections', 'Set 3-month big goals and break them down'],
    }
  }
  return {
    archetype: 'The Adventurer',
    description: 'You\'re adaptable and resilient. You bring energy everywhere and learn best by doing. Every day is a new quest.',
    suggestions: ['Try different quest types each week', 'Explore all Life RPG OS features', 'Mix solo and social challenges'],
  }
}

function starterHabits(archetype: string) {
  const shared = [
    { name: 'Plan tomorrow in 5 minutes', difficulty: 'easy', xp_reward: 10, stat_category: 'wis', emoji: '📝' },
    { name: 'Move your body for 20 minutes', difficulty: 'medium', xp_reward: 25, stat_category: 'vit', emoji: '🏃' },
  ]
  const signature = archetype === 'The Monk'
    ? { name: 'Complete one 25-minute focus block', difficulty: 'medium', xp_reward: 25, stat_category: 'int', emoji: '🎯' }
    : archetype === 'The Guild Leader'
      ? { name: 'Check in with an accountability partner', difficulty: 'easy', xp_reward: 10, stat_category: 'cha', emoji: '🤝' }
      : archetype === 'The Champion'
        ? { name: 'Finish your highest-value quest', difficulty: 'hard', xp_reward: 50, stat_category: 'str', emoji: '🏆' }
        : { name: 'Write one sentence about your bigger why', difficulty: 'easy', xp_reward: 10, stat_category: 'wis', emoji: '✨' }
  return [...shared, signature]
}

export default function PersonalityQuizPage() {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ReturnType<typeof deriveArchetype> | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  function handleAnswer(questionId: string, value: string) {
    const next = { ...answers, [questionId]: value }
    setAnswers(next)

    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ((q) => q + 1), 300)
    } else {
      setResult(deriveArchetype(next))
    }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: profileError } = await supabase.from('profiles').update({
        personality_type: {
          archetype: result.archetype,
          answers,
          completed_at: new Date().toISOString(),
        },
      }).eq('id', user.id)
      if (profileError) throw profileError

      const { count, error: habitsCountError } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (habitsCountError) throw habitsCountError
      if ((count ?? 0) === 0) {
        const { error: habitsError } = await supabase.from('habits').insert(
          starterHabits(result.archetype).map((habit) => ({ ...habit, user_id: user.id }))
        )
        if (habitsError) throw habitsError
      }

      // Patch coach memory with personality
      const { error: memoryError } = await supabase.from('coach_memory').insert({
        user_id: user.id,
        memory_type: 'personality',
        content: `User archetype: ${result.archetype}. ${result.description}`,
        importance: 5,
      })
      if (memoryError) throw memoryError

      toast.success(`Archetype saved: ${result.archetype} 🎭`)
      router.push('/dashboard')
    } catch (err) {
      console.error('Save personality error:', err)
      toast.error('Failed to save personality')
    } finally {
      setSaving(false)
    }
  }

  const progress = (currentQ / QUESTIONS.length) * 100
  const question = QUESTIONS[currentQ]

  return (
    <div className="min-h-screen bg-[#08080F] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 mb-4">
            <Brain size={28} className="text-purple-400" />
          </div>
          <h1 className="text-3xl font-black text-white font-display">Personality Quiz</h1>
          <p className="text-slate-400 text-sm mt-2">Discover your RPG archetype in 5 questions.</p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Progress Bar */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-purple-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-xs text-slate-400 font-display">{currentQ + 1}/{QUESTIONS.length}</span>
              </div>

              {/* Question */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-[#13131F] mb-5">
                <p className="text-lg font-bold text-white font-display">{question.text}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(question.id, opt.value)}
                    className="p-4 rounded-2xl border border-slate-800 bg-[#13131F] hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-left"
                  >
                    <div className="text-2xl mb-2">{opt.emoji}</div>
                    <div className="text-sm font-semibold text-white">{opt.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl border border-purple-500/40 bg-[#13131F] shadow-2xl shadow-purple-950/30"
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎭</div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400 font-display mb-1">Your Archetype</div>
                <h2 className="text-3xl font-black text-white font-display">{result.archetype}</h2>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">{result.description}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-3">Recommendations for you:</p>
                <div className="space-y-2">
                  {result.suggestions.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 font-display"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                {saving ? 'Setting up your quests...' : 'Save & Set Up My Quests'}
              </button>

              <button
                onClick={() => { setCurrentQ(0); setAnswers({}); setResult(null) }}
                className="w-full mt-2 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200"
              >
                Retake Quiz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
