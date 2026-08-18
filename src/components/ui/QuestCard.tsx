import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Dumbbell, Brain, Wind, Heart, Coins, Mic2, Sparkles, LucideIcon, Clock, Timer, Layers } from 'lucide-react'
import DifficultyBadge from './DifficultyBadge'

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
  vit:  { icon: Heart,    color: '#22C55E' },
  gold: { icon: Coins,    color: '#F59E0B' },
  cha:  { icon: Mic2,     color: '#EC4899' },
}

export default function QuestCard({ habit, isCompleted, onComplete }: QuestCardProps) {
  const statInfo = STAT_ICON_MAP[habit.stat_category]
  const IconComp = statInfo?.icon ?? Sparkles
  const statColor = statInfo?.color ?? '#9B99B8'

  // Card border dynamic state (Phase 2B)
  let borderColor = '#1E1E35'
  let glowClass = ''

  if (isCompleted) {
    borderColor = '#22C55E44'
  } else if (habit.is_overdue) {
    borderColor = '#EF444488'
    glowClass = 'shadow-md shadow-red-900/30'
  } else if (habit.is_due_soon) {
    borderColor = '#F59E0B88'
    glowClass = 'shadow-md shadow-amber-900/30'
  } else if (habit.is_stack_ready) {
    borderColor = '#9F67FF'
    glowClass = 'shadow-md shadow-purple-900/40 animate-pulse'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isCompleted ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${glowClass} ${
        isCompleted ? 'quest-complete' : ''
      }`}
      style={{
        background: isCompleted ? '#0F1A0F' : '#13131F',
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Icon / Category Badge */}
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
        <div className="flex items-center gap-2">
          <div
            className="font-medium text-sm truncate"
            style={{
              color: isCompleted ? '#22C55E' : '#F1F0FF',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}
          >
            {habit.name}
          </div>

          {/* Overdue / Due soon tags */}
          {!isCompleted && habit.is_overdue && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              Overdue
            </span>
          )}
          {!isCompleted && habit.is_due_soon && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Due Soon
            </span>
          )}
          {!isCompleted && habit.is_stack_ready && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              ⚡ Ready to Stack
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <DifficultyBadge difficulty={habit.difficulty} />

          <span className="text-xs flex items-center gap-1 font-bold text-purple-400 font-display">
            <Zap size={11} /> +{habit.xp_reward} XP
          </span>

          <span className="text-xs flex items-center gap-1 text-slate-400 font-display">
            <IconComp size={11} style={{ color: statColor }} /> {habit.stat_category.toUpperCase()}
          </span>

          {/* Scheduled time */}
          {habit.scheduled_time && (
            <span className="text-xs flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-display">
              <Clock size={11} /> {habit.scheduled_time}
            </span>
          )}

          {/* Duration */}
          {Boolean(habit.duration_minutes) && habit.duration_minutes! > 0 && (
            <span className="text-xs flex items-center gap-1 text-slate-400">
              <Timer size={11} /> ~{habit.duration_minutes}m
            </span>
          )}

          {/* Habit Stacking */}
          {habit.trigger_habit_name && (
            <span className="text-xs flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
              <Layers size={11} /> After {habit.trigger_habit_name}
            </span>
          )}
        </div>

        {/* Implementation intention summary */}
        {habit.implementation_intention && !isCompleted && (
          <p className="text-[11px] text-slate-500 italic mt-1 truncate">
            &ldquo;{habit.implementation_intention}&rdquo;
          </p>
        )}
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
