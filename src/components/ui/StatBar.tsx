import React from 'react'
import { motion } from 'framer-motion'

interface StatBarProps {
  label: string
  icon: React.ReactNode
  value: number
  maxValue?: number
  color: string
}

export default function StatBar({ label, icon, value, maxValue = 100, color }: StatBarProps) {
  const pct = Math.min((value / maxValue) * 100, 100)

  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
      <span className="text-xs w-10 flex-shrink-0 font-bold" style={{ color: '#6E6A61', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#EAE6DD' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, width: `${pct}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs w-6 text-right flex-shrink-0 font-semibold" style={{ color: '#232019', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        {value}
      </span>
    </div>
  )
}
