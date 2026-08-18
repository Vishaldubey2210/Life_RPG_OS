'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Sparkles, CheckCircle2, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface WeeklyChallenge {
  id: string
  week_start: string
  challenge_text: string
  target_stat: string
  target_completions: number
  current_completions: number
  bonus_xp: number
  completed: boolean
}

export function WeeklyChallengeCard({ userId }: { userId: string }) {
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadChallenge() {
      if (!userId) return
      try {
        const { data, error } = await supabase
          .from('weekly_challenges')
          .select('*')
          .eq('user_id', userId)
          .order('week_start', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching challenge:', error)
        }

        if (data) {
          setChallenge(data as WeeklyChallenge)
        } else {
          // Create default weekly challenge if none exists for this week
          const now = new Date()
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          const weekStartStr = startOfWeek.toISOString().split('T')[0]

          const newChallenge = {
            user_id: userId,
            week_start: weekStartStr,
            challenge_text: 'Complete at least 5 wisdom & intelligence quests this week to sharpen your mind.',
            target_stat: 'int',
            target_completions: 5,
            current_completions: 0,
            bonus_xp: 300,
            completed: false,
          }

          const { data: created } = await supabase
            .from('weekly_challenges')
            .insert(newChallenge)
            .select()
            .single()

          if (created) setChallenge(created as WeeklyChallenge)
        }
      } finally {
        setLoading(false)
      }
    }

    loadChallenge()
  }, [userId, supabase])

  if (loading || !challenge) return null

  const progressPct = Math.min(
    Math.round((challenge.current_completions / Math.max(challenge.target_completions, 1)) * 100),
    100
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border p-5 mb-6 shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(19, 19, 31, 0.95) 100%)',
        borderColor: '#F59E0B66',
        boxShadow: '0 0 25px rgba(245, 158, 11, 0.15)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
              color: '#000',
            }}
          >
            <Target size={20} className="stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: '#F59E0B22',
                  color: '#F59E0B',
                  border: '1px solid #F59E0B44',
                  fontFamily: 'Oxanium, sans-serif',
                }}
              >
                AI Weekly Focus Challenge
              </span>
              {challenge.completed && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                  <CheckCircle2 size={13} /> Completed
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-white mt-1 leading-snug">
              {challenge.challenge_text}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 flex-shrink-0">
          <Zap size={14} />
          <span className="text-xs font-bold font-display tracking-wide">+{challenge.bonus_xp} Bonus XP</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-amber-500/20">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Challenge Progress</span>
          <span className="text-amber-400 font-bold font-display">
            {challenge.current_completions} / {challenge.target_completions} ({progressPct}%)
          </span>
        </div>

        <div className="h-2 rounded-full overflow-hidden bg-slate-800/80 border border-slate-700/50">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: challenge.completed
                ? 'linear-gradient(90deg, #22C55E, #10B981)'
                : 'linear-gradient(90deg, #F59E0B, #EF4444)',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
