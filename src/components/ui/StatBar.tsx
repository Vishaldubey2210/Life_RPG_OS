'use client'

import { motion } from 'framer-motion'

interface StatBarProps {
  label: string
  icon: string
  value: number
  maxValue: number
  color: string
}

export default function StatBar({ label, icon, value, maxValue, color }: StatBarProps) {
  const pct = Math.min((value / maxValue) * 100, 100)

  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      <span className="text-xs w-10 flex-shrink-0" style={{ color: '#9B99B8', fontFamily: 'Oxanium, sans-serif' }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, width: `${pct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs w-6 text-right flex-shrink-0" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
        {value}
      </span>
    </div>
  )
}
