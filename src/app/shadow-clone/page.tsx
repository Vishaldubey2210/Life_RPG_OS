'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy, Clock, Zap, Target, CheckCircle2, Plus,
  X, Loader2, Users2, Award
} from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

interface ShadowCloneSession {
  id: string
  user_id: string
  partner_id: string | null
  habit_id: string | null
  session_code: string
  status: 'waiting' | 'active' | 'completed' | 'expired'
  started_at: string | null
  completed_at: string | null
  xp_bonus: number
  habit_name: string
  partner_name?: string
}

interface Habit {
  id: string
  name: string
  icon: string
}

export default function ShadowClonePage() {
  const { profile } = useProfile()
  const [mySession, setMySession] = useState<ShadowCloneSession | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedHabit, setSelectedHabit] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    if (!profile?.id) return
    try {
      // Get habits
      const { data: habitData } = await supabase
        .from('habits')
        .select('id, name, icon')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .order('name')
      setHabits((habitData as Habit[]) ?? [])
      if (habitData && habitData.length > 0 && !selectedHabit) {
        setSelectedHabit(habitData[0].id)
      }

      // Get active session
      const { data: session } = await supabase
        .from('shadow_clone_sessions')
        .select('*')
        .eq('user_id', profile.id)
        .in('status', ['waiting', 'active'])
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (session) {
        let partner_name = undefined
        if (session.partner_id) {
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', session.partner_id)
            .maybeSingle()
          partner_name = partnerProfile?.display_name ?? undefined
        }
        setMySession({ ...session, partner_name } as ShadowCloneSession)
      }
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase, selectedHabit])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime subscription
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel('shadow-clone')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shadow_clone_sessions',
        filter: `user_id=eq.${profile.id}`,
      }, () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id, supabase, loadData])

  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  async function handleCreate() {
    if (!profile?.id || !selectedHabit) return
    setCreating(true)
    try {
      const habit = habits.find((h) => h.id === selectedHabit)
      if (!habit) return

      const code = generateCode()
      const expireAt = new Date(Date.now() + 30 * 60000).toISOString()

      const { data, error } = await supabase
        .from('shadow_clone_sessions')
        .insert({
          user_id: profile.id,
          habit_id: selectedHabit,
          habit_name: habit.name,
          session_code: code,
          status: 'waiting',
          xp_bonus: 150,
          expires_at: expireAt,
        })
        .select()
        .single()

      if (error) throw error
      setMySession(data as ShadowCloneSession)
      toast.success('Shadow Clone session created!')
    } catch (err) {
      console.error('Create session error:', err)
      toast.error('Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  async function handleJoin() {
    if (!profile?.id || !joinCode.trim()) return
    setJoining(true)
    try {
      const { data: session } = await supabase
        .from('shadow_clone_sessions')
        .select('*')
        .eq('session_code', joinCode.toUpperCase().trim())
        .eq('status', 'waiting')
        .maybeSingle()

      if (!session) {
        toast.error('Session not found or expired')
        return
      }

      if (session.user_id === profile.id) {
        toast.error('You can\'t join your own session')
        return
      }

      const { error } = await supabase
        .from('shadow_clone_sessions')
        .update({ partner_id: profile.id, status: 'active' })
        .eq('id', session.id)

      if (error) throw error

      // Create mirror session for partner
      await supabase.from('shadow_clone_sessions').insert({
        user_id: profile.id,
        partner_id: session.user_id,
        habit_id: session.habit_id,
        habit_name: session.habit_name,
        session_code: joinCode.toUpperCase().trim(),
        status: 'active',
        xp_bonus: 150,
      })

      await loadData()
      toast.success('Joined Shadow Clone session! Work together! 🔮')
    } catch (err) {
      console.error('Join error:', err)
      toast.error('Failed to join session')
    } finally {
      setJoining(false)
    }
  }

  async function handleComplete() {
    if (!mySession?.id || !profile?.id) return
    try {
      await supabase
        .from('shadow_clone_sessions')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', mySession.id)

      // Award bonus XP
      await supabase.rpc('increment_xp', { user_id: profile.id, xp_amount: mySession.xp_bonus })

      setMySession(null)
      toast.success(`🔮 Shadow Clone complete! +${mySession.xp_bonus} XP bonus!`)
    } catch (err) {
      console.error('Complete error:', err)
      toast.error('Failed to complete session')
    }
  }

  async function handleCancel() {
    if (!mySession?.id) return
    await supabase
      .from('shadow_clone_sessions')
      .update({ status: 'expired' })
      .eq('id', mySession.id)
    setMySession(null)
    toast.info('Shadow Clone session cancelled')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#08080F]">
        <Sidebar />
        <div className="flex-1 md:ml-60 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#08080F]">
      <Sidebar />
      <main className="flex-1 md:ml-60 p-4 md:p-8 max-w-3xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 font-display mb-1.5">
            <Copy size={14} />
            <span>Shadow Clone Mode</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display mb-2">
            Accountability Partner
          </h1>
          <p className="text-slate-400 text-sm max-w-md">
            Work on the same habit simultaneously with a friend. Complete together for a +150 XP bonus.
          </p>
        </div>

        {mySession ? (
          // Active Session
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(8,8,15,0.95))',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 0 40px rgba(124,58,237,0.1)',
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10 bg-purple-500 pointer-events-none" />

            <div className="text-center mb-6">
              <div className="inline-block text-5xl mb-3">🔮</div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-400 font-display mb-1">
                {mySession.status === 'waiting' ? 'Waiting for Partner' : 'Session Active'}
              </div>
              <h2 className="text-xl font-extrabold text-white font-display">{mySession.habit_name}</h2>
            </div>

            {mySession.status === 'waiting' && (
              <div className="bg-[#0F0F1A] border border-purple-500/30 rounded-2xl p-5 text-center mb-5">
                <p className="text-xs text-slate-400 mb-2">Share this code with your partner:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-black tracking-widest text-purple-300 font-display">
                    {mySession.session_code}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(mySession.session_code)
                      toast.success('Copied!')
                    }}
                    className="p-2 rounded-lg bg-purple-500/15 text-purple-400 hover:bg-purple-500/25"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-500 text-xs">
                  <Clock size={12} /> Expires in 30 minutes
                </div>
              </div>
            )}

            {mySession.status === 'active' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center mb-5">
                <Users2 size={20} className="mx-auto text-green-400 mb-2" />
                <p className="text-sm font-bold text-green-400 font-display">
                  {mySession.partner_name ?? 'Your partner'} has joined!
                </p>
                <p className="text-xs text-slate-400 mt-1">Work on your habits now. Complete when done!</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
              <Award size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400 font-display">
                Completion Reward: +{mySession.xp_bonus} XP bonus
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl text-sm font-medium bg-slate-800 text-slate-400 hover:bg-slate-700"
              >
                Cancel
              </button>
              {mySession.status === 'active' && (
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-green-600 hover:bg-green-500 text-white flex items-center justify-center gap-2 font-display"
                >
                  <CheckCircle2 size={16} /> Mark Complete
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Create Session */}
            <div className="p-5 rounded-2xl border border-purple-500/30 bg-[#13131F]">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 mb-4">
                <Plus size={16} className="text-purple-400" /> Create Session
              </h3>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Habit</label>
                {habits.length === 0 ? (
                  <p className="text-xs text-slate-500">No habits yet. Create some first.</p>
                ) : (
                  <select
                    value={selectedHabit}
                    onChange={(e) => setSelectedHabit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0F0F1A] border border-slate-800 text-white outline-none focus:border-purple-500"
                  >
                    {habits.map((h) => (
                      <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 mb-4">
                🔮 Earn +150 XP when your partner completes the same habit.
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || habits.length === 0}
                className="w-full py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 font-display disabled:opacity-50"
              >
                {creating ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                Create Session
              </button>
            </div>

            {/* Join Session */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#13131F]">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 mb-4">
                <Target size={16} className="text-cyan-400" /> Join Session
              </h3>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Session Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AB3X9K"
                  maxLength={6}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0F0F1A] border border-slate-800 text-white outline-none focus:border-cyan-500 font-display tracking-widest text-center font-bold text-lg"
                />
              </div>
              <div className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 mb-4">
                👥 Enter a code from your partner to work together in sync.
              </div>
              <button
                onClick={handleJoin}
                disabled={joining || joinCode.length < 6}
                className="w-full py-3 rounded-xl text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-2 font-display disabled:opacity-50"
              >
                {joining ? <Loader2 size={15} className="animate-spin" /> : <Target size={15} />}
                Join Session
              </button>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="mt-8 p-5 rounded-2xl border border-slate-800 bg-[#13131F]">
          <h3 className="text-sm font-bold text-white font-display mb-4">How Shadow Clone Works</h3>
          <div className="space-y-3">
            {[
              { icon: '🔮', title: 'Create a session', desc: 'Choose a habit and generate a session code' },
              { icon: '📤', title: 'Share the code', desc: 'Send the 6-character code to your accountability partner' },
              { icon: '⚔️', title: 'Work together', desc: 'Both of you complete your respective habits' },
              { icon: '🏆', title: 'Both earn bonus XP', desc: 'Mark complete to collect +150 bonus XP each' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-sm flex items-center justify-center flex-shrink-0">{step.icon}</div>
                <div>
                  <div className="text-xs font-bold text-white">{step.title}</div>
                  <div className="text-[11px] text-slate-400">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
