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
      return data as CompleteHabitResult
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['completions'] })
    },
  })

  return {
    completeHabit: async (habitId: string) => mutation.mutateAsync({ habitId }),
    loading: mutation.isPending,
    result: mutation.data ?? null,
  }
}
