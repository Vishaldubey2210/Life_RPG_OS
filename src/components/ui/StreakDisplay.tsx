'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface StreakDisplayProps {
  streak: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function getStreakTier(streak: number) {
  if (streak >= 30) return {
    flame: '👑🔥',
    label: 'Legendary Streak!',
    color: '#F59E0B',
    glowClass: 'streak-gold',
    bgColor: '#F59E0B15',
    borderColor: '#F59E0B44',
  }
  if (streak >= 14) return {
    flame: '💜🔥',
    label: 'Unstoppable!',
    color: '#7C3AED',
    glowClass: 'streak-purple',
    bgColor: '#7C3AED15',
    borderColor: '#7C3AED44',
  }
  if (streak >= 7) return {
    flame: '🔥🔥',
    label: 'On Fire!',
    color: '#EF4444',
    glowClass: 'streak-orange',
    bgColor: '#EF444415',
    borderColor: '#EF444444',
  }
  if (streak >= 3) return {
    flame: '🔥',
    label: 'Heating up!',
    color: '#F97316',
    glowClass: 'streak-orange',
    bgColor: '#F9731615',
    borderColor: '#F9731644',
  }
  return {
    flame: streak > 0 ? '🔥' : '💤',
    label: streak > 0 ? 'Keep going!' : 'No streak yet',
    color: '#5C5A7A',
    glowClass: '',
    bgColor: '#1E1E3515',
    borderColor: '#1E1E35',
  }
}

export default function StreakDisplay({ streak, showLabel = true, size = 'md' }: StreakDisplayProps) {
  const tier = getStreakTier(streak)
  const isPulsing = streak >= 7

  const sizes = {
    sm: { flame: 'text-lg', number: 'text-base', label: 'text-xs' },
    md: { flame: 'text-2xl', number: 'text-xl', label: 'text-xs' },
    lg: { flame: 'text-3xl', number: 'text-2xl', label: 'text-sm' },
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300"
      style={{
        background: tier.bgColor,
        borderColor: tier.borderColor,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={streak}
          className={`${sizes[size].flame} ${tier.glowClass} ${isPulsing ? 'fire-pulse' : ''}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {tier.flame}
        </motion.span>
      </AnimatePresence>

      <div className="flex flex-col">
        <motion.span
          key={streak}
          className={`font-bold leading-tight ${sizes[size].number}`}
          style={{ fontFamily: 'Oxanium, sans-serif', color: tier.color }}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {streak}d
        </motion.span>
        {showLabel && (
          <span className={sizes[size].label} style={{ color: tier.color, opacity: 0.8 }}>
            {tier.label}
          </span>
        )}
      </div>
    </div>
  )
}
