import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Dumbbell, Brain, Wind, Heart, Coins, Mic2, Sparkles, LucideIcon, Clock, Timer, Layers } from 'lucide-react'
import DifficultyBadge from './DifficultyBadge'
import DynamicIcon from './DynamicIcon'

export interface Habit {
  id: string
  name: string
  difficulty: string
  xp_reward: number
  stat_category: string
  emoji: string
  is_active: boolean
  scheduled_time?: string
  duration_minutes?: number
  trigger_habit_id?: string
  trigger_habit_name?: string
  is_stack_ready?: boolean
  is_due_soon?: boolean
  is_overdue?: boolean
  implementation_intention?: string
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
  vit:  { icon: Heart,    color: '#10B981' },
  gold: { icon: Coins,    color: '#D97706' },
  cha:  { icon: Mic2,     color: '#EC4899' },
}

export default function QuestCard({ habit, isCompleted, onComplete }: QuestCardProps) {
  const statInfo = STAT_ICON_MAP[habit.stat_category]
  const IconComp = statInfo?.icon ?? Sparkles
  const statColor = statInfo?.color ?? '#5B57F0'

  let borderColor = '#EAE6DD'
  let glowClass = ''

  if (isCompleted) {
    borderColor = '#A7F3D0'
  } else if (habit.is_overdue) {
    borderColor = '#FCA5A5'
    glowClass = 'shadow-md shadow-red-500/10'
  } else if (habit.is_due_soon) {
    borderColor = '#FDE68A'
    glowClass = 'shadow-md shadow-amber-500/10'
  } else if (habit.is_stack_ready) {
    borderColor = '#C4B5FD'
    glowClass = 'shadow-md shadow-purple-500/15 animate-pulse'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isCompleted ? 0.75 : 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`p-3.5 rounded-2xl flex items-center gap-3.5 transition-all duration-200 ${glowClass} ${
        isCompleted ? 'quest-complete' : ''
      }`}
      style={{
        backgroundColor: isCompleted ? '#ECFDF5' : '#FAF8F5',
        border: `1px solid ${borderColor}`,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Icon / Category Badge */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `${statColor}15`,
          border: `1px solid ${statColor}30`,
          color: statColor,
        }}
      >
        <DynamicIcon name={habit.emoji} fallback={IconComp} size={18} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="font-semibold text-sm truncate"
            style={{
              color: isCompleted ? '#059669' : '#232019',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}
          >
            {habit.name}
          </div>
          {habit.is_stack_ready && (
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"
              style={{ backgroundColor: '#EDECFD', color: '#5B57F0', border: '1px solid #D6D3FA' }}
            >
              <Layers size={10} />
              <span>STACK READY</span>
            </span>
          )}
          {habit.is_due_soon && (
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"
              style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}
            >
              <Clock size={10} />
              <span>DUE SOON</span>
            </span>
          )}
          {habit.is_overdue && (
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
            >
              <Clock size={10} />
              <span>OVERDUE</span>
            </span>
          )}
        </div>

        {/* Sub-meta details */}
        <div className="flex items-center gap-2 mt-1">
          <DifficultyBadge difficulty={habit.difficulty} />
          <span
            className="text-[11px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#EDECFD', color: '#5B57F0' }}
          >
            <Zap size={11} className="fill-current" />
            <span>+{habit.xp_reward} XP</span>
          </span>
          {habit.duration_minutes && (
            <span
              className="text-[11px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#F0ECE1', color: '#6E6A61' }}
            >
              <Timer size={11} />
              <span>{habit.duration_minutes}m</span>
            </span>
          )}
        </div>
      </div>

      {/* Checkbox / Action Button */}
      <button
        onClick={() => onComplete(habit.id)}
        disabled={isCompleted}
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          isCompleted ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'
        }`}
        style={{
          backgroundColor: isCompleted ? '#10B981' : '#FFFFFF',
          border: isCompleted ? '1px solid #10B981' : '1.5px solid #D6D3FA',
          color: isCompleted ? '#FFFFFF' : '#5B57F0',
          boxShadow: isCompleted ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 1px 4px rgba(91, 87, 240, 0.08)',
        }}
        aria-label={isCompleted ? 'Completed' : `Complete ${habit.name}`}
      >
        {isCompleted ? <Check size={18} strokeWidth={3} /> : <Check size={18} strokeWidth={2.5} />}
      </button>
    </motion.div>
  )
}
