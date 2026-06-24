'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Party {
  id: string
  name: string
  emoji: string
  party_type: 'friends' | 'couple' | 'family'
  invite_code: string
  created_by: string
  max_members: number
  created_at: string
}

export interface PartyMember {
  id: string
  party_id: string
  user_id: string
  role: 'leader' | 'member'
  joined_at: string
  profile: {
    display_name: string
    avatar_emoji: string
    level: number
    streak: number
    xp: number
    hp: number
    hp_max: number
  }
  quests_done_today: number
  quests_total: number
}

export interface ActivityEvent {
  id: string
  type: 'completion' | 'levelup' | 'streak' | 'reaction'
  user_name: string
  user_avatar: string
  message: string
  xp?: number
  timestamp: string
}

interface UsePartyReturn {
  party: Party | null
  members: PartyMember[]
  activity: ActivityEvent[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useParty(): UsePartyReturn {
  const supabase = createClient()
  const [party, setParty] = useState<Party | null>(null)
  const [members, setMembers] = useState<PartyMember[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchParty = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Find current party membership
      const { data: membership } = await supabase
        .from('party_members')
        .select('party_id')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!membership) {
        setParty(null)
        setMembers([])
        setLoading(false)
        return
      }

      // Fetch party details
      const { data: partyData, error: partyErr } = await supabase
        .from('parties')
        .select('*')
        .eq('id', membership.party_id)
        .single()

      if (partyErr) throw partyErr
      setParty(partyData)

      // Fetch members with profiles
      const { data: memberData, error: memberErr } = await supabase
        .from('party_members')
        .select(`
          id, party_id, user_id, role, joined_at,
          profiles:user_id (display_name, avatar_emoji, level, streak, xp, hp, hp_max)
        `)
        .eq('party_id', membership.party_id)

      if (memberErr) throw memberErr

      // Fetch today's completions for each member
      const today = new Date().toISOString().split('T')[0]
      const memberIds = (memberData ?? []).map((m: { user_id: string }) => m.user_id)

      let completionsMap: Record<string, number> = {}
      let totalHabitsMap: Record<string, number> = {}

      if (memberIds.length > 0) {
        const { data: completionsData } = await supabase
          .from('habit_completions')
          .select('user_id')
          .in('user_id', memberIds)
          .gte('completed_at', `${today}T00:00:00`)
          .lt('completed_at', `${today}T23:59:59`)

        const { data: habitsData } = await supabase
          .from('habits')
          .select('user_id')
          .in('user_id', memberIds)
          .eq('is_active', true)

        completionsMap = (completionsData ?? []).reduce((acc: Record<string, number>, c: { user_id: string }) => {
          acc[c.user_id] = (acc[c.user_id] ?? 0) + 1
          return acc
        }, {})

        totalHabitsMap = (habitsData ?? []).reduce((acc: Record<string, number>, h: { user_id: string }) => {
          acc[h.user_id] = (acc[h.user_id] ?? 0) + 1
          return acc
        }, {})
      }

      const enrichedMembers: PartyMember[] = (memberData ?? []).map((m: {
        id: string
        party_id: string
        user_id: string
        role: 'leader' | 'member'
        joined_at: string
        profiles: {
          display_name: string
          avatar_emoji: string
          level: number
          streak: number
          xp: number
          hp: number
          hp_max: number
        } | {
          display_name: string
          avatar_emoji: string
          level: number
          streak: number
          xp: number
          hp: number
          hp_max: number
        }[]
      }) => ({
        id: m.id,
        party_id: m.party_id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
        quests_done_today: completionsMap[m.user_id] ?? 0,
        quests_total: totalHabitsMap[m.user_id] ?? 0,
      }))

      setMembers(enrichedMembers)

      // Fetch recent activity (recent completions by party members)
      if (memberIds.length > 0) {
        const { data: recentCompletions } = await supabase
          .from('habit_completions')
          .select(`
            id, user_id, completed_at,
            habits:habit_id (name, xp_reward)
          `)
          .in('user_id', memberIds)
          .order('completed_at', { ascending: false })
          .limit(20)

        const profileMap: Record<string, { display_name: string; avatar_emoji: string }> = {}
        enrichedMembers.forEach(m => {
          profileMap[m.user_id] = m.profile
        })

        const events: ActivityEvent[] = (recentCompletions ?? []).map((c: {
          id: string
          user_id: string
          completed_at: string
          habits: { name: string; xp_reward: number } | { name: string; xp_reward: number }[]
        }) => {
          const profile = profileMap[c.user_id] ?? { display_name: 'Unknown', avatar_emoji: '⚔️' }
          const habit = Array.isArray(c.habits) ? c.habits[0] : c.habits
          return {
            id: c.id,
            type: 'completion' as const,
            user_name: profile.display_name,
            user_avatar: profile.avatar_emoji,
            message: `completed ${habit?.name ?? 'a quest'} +${habit?.xp_reward ?? 0} XP 🎯`,
            xp: habit?.xp_reward ?? 0,
            timestamp: c.completed_at,
          }
        })

        setActivity(events)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load party')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchParty()
  }, [fetchParty])

  return { party, members, activity, loading, error, refetch: fetchParty }
}
