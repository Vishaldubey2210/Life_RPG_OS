import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Crown, Moon } from 'lucide-react'

interface StreakDisplayProps {
  streak: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function getStreakTier(streak: number) {
  if (streak >= 30) return {
    isCrown: true,
    label: 'Legendary Streak!',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FDE68A',
  }
  if (streak >= 14) return {
    isCrown: false,
    label: 'Unstoppable!',
    color: '#5B57F0',
    bgColor: '#EDECFD',
    borderColor: '#D6D3FA',
  }
  if (streak >= 7) return {
    isCrown: false,
    label: 'On Fire!',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FECACA',
  }
  if (streak >= 3) return {
    isCrown: false,
    label: 'Heating up!',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    borderColor: '#FED7AA',
  }
  return {
    isCrown: false,
    label: streak > 0 ? 'Keep going!' : 'No streak yet',
    color: '#8A857A',
    bgColor: '#FAF8F5',
    borderColor: '#EAE6DD',
  }
}

export default function StreakDisplay({ streak, showLabel = true, size = 'md' }: StreakDisplayProps) {
  const tier = getStreakTier(streak)
  const isPulsing = streak >= 7

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }
  const textSizes = {
    sm: { number: 'text-sm font-bold', label: 'text-[10px]' },
    md: { number: 'text-base font-bold', label: 'text-[11px]' },
    lg: { number: 'text-xl font-extrabold', label: 'text-xs' },
  }

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-200"
      style={{
        backgroundColor: tier.bgColor,
        borderColor: tier.borderColor,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={streak}
          className={`flex items-center justify-center ${isPulsing ? 'animate-pulse' : ''}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{ color: tier.color }}
        >
          {streak === 0 ? (
            <Moon size={iconSizes[size]} style={{ color: '#8A857A' }} />
          ) : tier.isCrown ? (
            <div className="relative flex items-center justify-center">
              <Crown size={iconSizes[size] - 4} className="absolute -top-2" style={{ color: '#D97706' }} />
              <Flame size={iconSizes[size]} style={{ color: '#D97706' }} />
            </div>
          ) : (
            <Flame size={iconSizes[size]} style={{ color: tier.color }} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col">
        <motion.span
          key={streak}
          className={`leading-tight ${textSizes[size].number}`}
          style={{ color: tier.color }}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {streak}d
        </motion.span>
        {showLabel && (
          <span className={`${textSizes[size].label} font-semibold`} style={{ color: tier.color, opacity: 0.9 }}>
            {tier.label}
          </span>
        )}
      </div>
    </div>
  )
}
