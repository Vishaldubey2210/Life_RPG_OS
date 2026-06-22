'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import DifficultyBadge from './DifficultyBadge'

export interface Habit {
  id: string
  name: string
  difficulty: string
  xp_reward: number
  stat_category: string
  emoji: string
  is_active: boolean
}

interface QuestCardProps {
  habit: Habit
  isCompleted: boolean
  onComplete: (habitId: string) => void
}

const STAT_ICONS: Record<string, string> = {
  str: '💪',
  int: '🧠',
  wis: '🧘',
  vit: '❤️',
  gold: '💰',
  cha: '🗣️',
}

export default function QuestCard({ habit, isCompleted, onComplete }: QuestCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isCompleted ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-xl flex items-center gap-4 transition-all duration-300 card-glow ${
        isCompleted ? 'quest-complete' : ''
      }`}
      style={{
        background: isCompleted ? '#0F1A0F' : '#13131F',
        border: isCompleted ? '1px solid #22C55E44' : '1px solid #1E1E35',
      }}
    >
      {/* Emoji */}
      <div className="text-2xl flex-shrink-0">{habit.emoji}</div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div
          className="font-medium text-sm truncate"
          style={{
            color: isCompleted ? '#22C55E' : '#F1F0FF',
            textDecoration: isCompleted ? 'line-through' : 'none',
          }}
        >
          {habit.name}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <DifficultyBadge difficulty={habit.difficulty} />
          <span className="text-xs" style={{ color: '#7C3AED' }}>
            ⚡ +{habit.xp_reward} XP
          </span>
          <span className="text-xs" style={{ color: '#5C5A7A' }}>
            {STAT_ICONS[habit.stat_category] ?? '⭐'} {habit.stat_category.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Checkbox */}
      <button
        onClick={() => !isCompleted && onComplete(habit.id)}
        disabled={isCompleted}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
        style={{
          background: isCompleted ? '#22C55E' : '#1A1A2E',
          border: isCompleted ? '2px solid #22C55E' : '2px solid #2E2E50',
          cursor: isCompleted ? 'default' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isCompleted) e.currentTarget.style.borderColor = '#7C3AED'
        }}
        onMouseLeave={(e) => {
          if (!isCompleted) e.currentTarget.style.borderColor = '#2E2E50'
        }}
      >
        {isCompleted ? (
          <Check size={16} color="#fff" />
        ) : (
          <div className="w-3 h-3 rounded-sm" style={{ background: 'transparent' }} />
        )}
      </button>
    </motion.div>
  )
}
