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
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium" style={{ color: '#6E6A61' }}>
          Level <span style={{ color: '#5B57F0', fontWeight: 700 }}>{level}</span>
        </span>
        <span className="text-xs font-semibold" style={{ color: '#232019' }}>
          {currentXP} / {maxXP} XP
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden relative" style={{ background: '#EAE6DD' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #5B57F0 0%, #8A86FF 100%)',
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
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2.5s infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  )
}
