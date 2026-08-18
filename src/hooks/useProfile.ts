'use client'

import { useQuery } from '@tanstack/react-query'
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

  const query = useQuery({
    queryKey: ['profile'],
    enabled: !!supabase,
    queryFn: async () => {
      if (!supabase) {
        return { profile: null, stats: null, habits: [], completions_today: [] }
      }

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

      return {
        profile: profileRes.data,
        stats: statsRes.data,
        habits: habitsRes.data ?? [],
        completions_today: completionsRes.data?.map((c: { habit_id: string }) => c.habit_id) ?? [],
      }
    },
  })

  return {
    profile: query.data?.profile ?? null,
    stats: query.data?.stats ?? null,
    habits: query.data?.habits ?? [],
    completions_today: query.data?.completions_today ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: () => { void query.refetch() },
  }
}
