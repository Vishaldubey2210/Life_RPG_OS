'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Profile {
  id: string
  display_name: string
  avatar_emoji: string
  level: number
  xp: number
  xp_to_next: number
  hp: number
  hp_max: number
  streak: number
  onboarding_completed: boolean
  created_at: string
}

export interface Stats {
  str: number
  int: number
  wis: number
  vit: number
  gold: number
  cha: number
}

export interface Habit {
  id: string
  name: string
  difficulty: string
  xp_reward: number
  stat_category: string
  emoji: string
  is_active: boolean
}

export interface HabitCompletion {
  id: string
  habit_id: string
  completed_at: string
}

interface UseProfileReturn {
  profile: Profile | null
  stats: Stats | null
  habits: Habit[]
  completions_today: string[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const today = () => new Date().toISOString().split('T')[0]

export function useProfile(): UseProfileReturn {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [completionsToday, setCompletionsToday] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const [profileRes, statsRes, habitsRes, completionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('stats').select('*').eq('user_id', user.id).single(),
        supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase
          .from('habit_completions')
          .select('habit_id')
          .eq('user_id', user.id)
          .gte('completed_at', today() + 'T00:00:00')
          .lt('completed_at', today() + 'T23:59:59'),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (statsRes.data) setStats(statsRes.data)
      if (habitsRes.data) setHabits(habitsRes.data)
      if (completionsRes.data) {
        setCompletionsToday(completionsRes.data.map((c: { habit_id: string }) => c.habit_id))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    profile,
    stats,
    habits,
    completions_today: completionsToday,
    loading,
    error,
    refetch: fetchAll,
  }
}
