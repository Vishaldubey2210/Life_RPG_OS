'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface NewAchievement {
  key: string
  name: string
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xp_reward: number
  description: string
}

export interface CompleteHabitResult {
  success: boolean
  xp_earned: number
  leveled_up: boolean
  new_level: number
  streak: number
  multiplier: number
  new_achievements: NewAchievement[]
}

interface UseCompleteHabitReturn {
  completeHabit: (habitId: string) => Promise<CompleteHabitResult | null>
  loading: boolean
  result: CompleteHabitResult | null
}

export function useCompleteHabit(): UseCompleteHabitReturn {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ habitId }: { habitId: string }): Promise<CompleteHabitResult | null> => {
      if (!supabase) return null

      const { data, error } = await supabase.rpc('complete_habit', { p_habit_id: habitId })
      if (error) throw error
      // Boss progress is intentionally best-effort: a completed habit must never fail
      // just because the optional party raid is unavailable or has already ended.
      const { error: bossError } = await supabase.rpc('contribute_to_active_boss')
      if (bossError && bossError.code !== 'PGRST202') {
        console.warn('Could not add boss battle contribution:', bossError.message)
      }
      return data as CompleteHabitResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      queryClient.invalidateQueries({ queryKey: ['boss-battle'] })
    },
  })

  return {
    completeHabit: async (habitId: string) => mutation.mutateAsync({ habitId }),
    loading: mutation.isPending,
    result: mutation.data ?? null,
  }
}
