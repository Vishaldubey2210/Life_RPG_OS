'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

export interface NewAchievement {
  key: string
  name: string
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xp_reward: number
  description: string
}

interface AchievementUnlockModalProps {
  achievements: NewAchievement[]
  onAllDismissed: () => void
}

const RARITY_STYLES = {
  common:    { label: 'COMMON ACHIEVEMENT',    color: '#9B99B8', glow: 'rgba(155,153,184,0.3)',  bg: '#1A1A2E', border: '#3E3E5A' },
  rare:      { label: '⚡ RARE ACHIEVEMENT',    color: '#3B82F6', glow: 'rgba(59,130,246,0.3)',   bg: '#1A1E2E', border: '#3B82F644' },
  epic:      { label: '🔮 EPIC ACHIEVEMENT',   color: '#7C3AED', glow: 'rgba(124,58,237,0.4)',   bg: '#1A1630', border: '#7C3AED55' },
  legendary: { label: '👑 LEGENDARY ACHIEVEMENT', color: '#F59E0B', glow: 'rgba(245,158,11,0.5)', bg: '#1F1A10', border: '#F59E0B55' },
}

export default function AchievementUnlockModal({ achievements, onAllDismissed }: AchievementUnlockModalProps) {
  const [queue, setQueue] = useState<NewAchievement[]>([])
  const [current, setCurrent] = useState<NewAchievement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (achievements.length > 0) {
      setQueue(achievements)
    }
  }, [achievements])

  const showNext = useCallback(() => {
    setQueue(prev => {
      if (prev.length === 0) {
        setVisible(false)
        setCurrent(null)
        onAllDismissed()
        return []
      }
      const [next, ...rest] = prev
      setCurrent(next)
      setVisible(true)

      // Confetti burst based on rarity
      const colors = next.rarity === 'legendary'
        ? ['#F59E0B', '#FFD700', '#FFA500']
        : next.rarity === 'epic'
        ? ['#7C3AED', '#9F67FF', '#EC4899']
        : ['#3B82F6', '#22C55E', '#7C3AED']

      setTimeout(() => {
        confetti({
          particleCount: next.rarity === 'legendary' ? 200 : next.rarity === 'epic' ? 120 : 60,
          spread: 80,
          origin: { y: 0.5 },
          colors,
        })
      }, 300)

      return rest
    })
  }, [onAllDismissed])

  useEffect(() => {
    if (queue.length > 0 && !visible) showNext()
  }, [queue, visible, showNext])

  const dismiss = useCallback(() => {
    setVisible(false)
    setCurrent(null)
    setTimeout(showNext, 400)
  }, [showNext])

  // Auto dismiss after 3.5s
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(dismiss, 3500)
    return () => clearTimeout(t)
  }, [visible, current, dismiss])

  if (!current) return null

  const style = RARITY_STYLES[current.rarity]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          style={{ background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          <motion.div
            className="relative mx-4 max-w-sm w-full text-center p-8 rounded-3xl border"
            style={{
              background: style.bg,
              borderColor: style.border,
              boxShadow: `0 0 80px ${style.glow}, 0 0 40px ${style.glow}`,
            }}
            initial={{ y: 100, scale: 0.7, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -60, scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Rarity banner */}
            <div
              className="absolute top-0 left-0 right-0 py-1.5 text-xs font-bold tracking-widest rounded-t-3xl"
              style={{ background: style.color + '22', color: style.color, fontFamily: 'Oxanium, sans-serif' }}
            >
              {style.label}
            </div>

            <div className="mt-6">
              {/* Emoji */}
              <motion.div
                className="text-7xl mb-4"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 14 }}
              >
                {current.emoji}
              </motion.div>

              {/* Name */}
              <motion.h2
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {current.name}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-sm mb-4"
                style={{ color: '#9B99B8' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {current.description}
              </motion.p>

              {/* XP reward */}
              <motion.div
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#F59E0B15', color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                ⚡ +{current.xp_reward} XP earned
              </motion.div>

              {/* Dismiss hint */}
              <div className="mt-4 text-xs" style={{ color: '#5C5A7A' }}>
                Tap anywhere to continue
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
