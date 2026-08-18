'use client'

import { motion } from 'framer-motion'

interface StatWidgetProps {
  icon: string
  label: string
  value: string | number
  change?: number
  color: 'purple' | 'green' | 'blue' | 'amber' | 'red'
  size?: 'sm' | 'md' | 'lg'
}

const colorMap = {
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    accent: '#A78BFA',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-300',
    accent: '#4ADE80',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    accent: '#60A5FA',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    accent: '#FBBF24',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-300',
    accent: '#F87171',
  },
}

const sizeMap = {
  sm: {
    container: 'p-4',
    icon: 'text-3xl',
    label: 'text-xs',
    value: 'text-xl',
  },
  md: {
    container: 'p-5',
    icon: 'text-4xl',
    label: 'text-sm',
    value: 'text-2xl',
  },
  lg: {
    container: 'p-6',
    icon: 'text-5xl',
    label: 'text-base',
    value: 'text-3xl',
  },
}

export function StatWidget({
  icon,
  label,
  value,
  change,
  color,
  size = 'md',
}: StatWidgetProps) {
  const colors = colorMap[color]
  const sizes = sizeMap[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border ${colors.border} ${colors.bg} ${sizes.container} backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className={`${sizes.label} uppercase tracking-wider text-slate-400 mb-2`}>
            {label}
          </div>
          <div className={`${sizes.value} font-bold text-white`}>
            {value}
          </div>
          {change !== undefined && (
            <div className={`text-xs mt-1 ${change > 0 ? 'text-green-300' : change < 0 ? 'text-red-300' : 'text-slate-400'}`}>
              {change > 0 ? '+' : ''}{change}% today
            </div>
          )}
        </div>
        <div className={`${sizes.icon} opacity-60`}>{icon}</div>
      </div>
    </motion.div>
  )
}

interface ProgressWidgetProps {
  label: string
  current: number
  max: number
  color: 'purple' | 'green' | 'blue' | 'amber'
  icon?: string
}

export function ProgressWidget({
  label,
  current,
  max,
  color,
  icon,
}: ProgressWidgetProps) {
  const colors = colorMap[color]
  const percentage = (current / max) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400">
            {label}
          </div>
          <div className="text-lg font-bold text-white mt-1">
            {current} / {max}
          </div>
        </div>
        {icon && <div className="text-3xl opacity-60">{icon}</div>}
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: colors.accent }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}
