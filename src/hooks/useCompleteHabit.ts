'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CompleteHabitResult {
  xp_earned: number
  leveled_up: boolean
  new_level: number
  streak: number
  multiplier: number
}

interface UseCompleteHabitReturn {
  completeHabit: (habitId: string) => Promise<CompleteHabitResult | null>
  loading: boolean
  result: CompleteHabitResult | null
}

export function useCompleteHabit(): UseCompleteHabitReturn {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CompleteHabitResult | null>(null)

  const completeHabit = useCallback(async (habitId: string): Promise<CompleteHabitResult | null> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('complete_habit', { p_habit_id: habitId })
      if (error) throw error
      const res = data as CompleteHabitResult
      setResult(res)
      return res
    } catch (err) {
      console.error('Failed to complete habit:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { completeHabit, loading, result }
}
