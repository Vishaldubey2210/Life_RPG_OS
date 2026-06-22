'use client'

import { motion } from 'framer-motion'

interface XPBarProps {
  currentXP: number
  maxXP: number
  level: number
}

export default function XPBar({ currentXP, maxXP, level }: XPBarProps) {
  const pct = Math.min((currentXP / maxXP) * 100, 100)

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: '#9B99B8' }}>
          Level <span style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}>{level}</span>
        </span>
        <span className="text-xs" style={{ color: '#9B99B8', fontFamily: 'Oxanium, sans-serif' }}>
          {currentXP} / {maxXP} XP
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden relative" style={{ background: '#1E1E35' }}>
        <motion.div
          className="h-full rounded-full xp-bar-fill"
          style={{
            background: 'linear-gradient(90deg, #7C3AED, #9F67FF)',
            width: `${pct}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Shimmer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  )
}
