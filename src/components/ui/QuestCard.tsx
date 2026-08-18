import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Dumbbell, Brain, Wind, Heart, Coins, Mic2, Sparkles, LucideIcon } from 'lucide-react'
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

const STAT_ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  str:  { icon: Dumbbell, color: '#EF4444' },
  int:  { icon: Brain,    color: '#3B82F6' },
  wis:  { icon: Wind,     color: '#8B5CF6' },
  vit:  { icon: Heart,    color: '#22C55E' },
  gold: { icon: Coins,    color: '#F59E0B' },
  cha:  { icon: Mic2,     color: '#EC4899' },
}

export default function QuestCard({ habit, isCompleted, onComplete }: QuestCardProps) {
  const statInfo = STAT_ICON_MAP[habit.stat_category]
  const IconComp = statInfo?.icon ?? Sparkles
  const statColor = statInfo?.color ?? '#9B99B8'

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
      {/* Icon / Emoji */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{
          background: `${statColor}18`,
          border: `1px solid ${statColor}33`,
          color: statColor,
        }}
      >
        {habit.emoji ? habit.emoji : <IconComp size={18} />}
      </div>

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
          <span className="text-xs flex items-center gap-1 font-bold" style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}>
            <Zap size={11} /> +{habit.xp_reward} XP
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: '#5C5A7A' }}>
            <IconComp size={11} style={{ color: statColor }} /> {habit.stat_category.toUpperCase()}
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
