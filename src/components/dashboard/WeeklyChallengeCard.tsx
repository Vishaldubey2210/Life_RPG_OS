'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, CheckCircle2, Zap } from 'lucide-react'
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
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border p-5 mb-6 bg-white shadow-sm"
      style={{
        borderColor: '#EAE6DD',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
            }}
          >
            <Target size={20} className="stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  border: '1px solid #FDE68A',
                }}
              >
                AI Weekly Focus Challenge
              </span>
              {challenge.completed && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 size={13} /> Completed
                </span>
              )}
            </div>
            <p className="text-[13.5px] font-bold text-[#232019] mt-1.5 leading-snug">
              {challenge.challenge_text}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-xl border border-[#FDE68A] bg-[#FEF3C7] text-[#B45309] flex-shrink-0">
          <Zap size={14} className="fill-current text-[#D97706]" />
          <span className="text-xs font-bold">+{challenge.bonus_xp} Bonus XP</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t" style={{ borderColor: '#EAE6DD' }}>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#6E6A61] font-medium">Challenge Progress</span>
          <span className="text-[#D97706] font-bold">
            {challenge.current_completions} / {challenge.target_completions} ({progressPct}%)
          </span>
        </div>

        <div className="h-2 rounded-full overflow-hidden bg-[#EAE6DD]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: challenge.completed
                ? 'linear-gradient(90deg, #10B981, #059669)'
                : 'linear-gradient(90deg, #5B57F0, #8A86FF)',
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
