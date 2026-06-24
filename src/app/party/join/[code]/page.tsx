'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, ArrowRight, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface PageProps {
  params: Promise<{ code: string }>
}

interface Party {
  id: string
  name: string
  emoji: string
  party_type: string
  max_members: number
  invite_code: string
}

export default function PartyJoinPage({ params }: PageProps) {
  const supabase = createClient()
  const router = useRouter()
  const [code, setCode] = useState<string>('')
  const [party, setParty] = useState<Party | null>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setCode(p.code))
  }, [params])

  useEffect(() => {
    if (!code) return

    async function fetchParty() {
      setLoading(true)
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push(`/login?redirect=/party/join/${code}`)
          return
        }

        const { data: partyData, error: partyErr } = await supabase
          .from('parties')
          .select('*')
          .eq('invite_code', code.toUpperCase())
          .single()

        if (partyErr || !partyData) {
          setError('Party not found. The invite code may be invalid or expired.')
          setLoading(false)
          return
        }

        setParty(partyData)

        const { count } = await supabase
          .from('party_members')
          .select('*', { count: 'exact' })
          .eq('party_id', partyData.id)

        setMemberCount(count ?? 0)
      } catch {
        setError('Failed to load party details.')
      } finally {
        setLoading(false)
      }
    }

    fetchParty()
  }, [code, supabase, router])

  async function handleJoin() {
    if (!party) return
    setJoining(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { error: joinErr } = await supabase.from('party_members').insert({
        party_id: party.id,
        user_id: user.id,
        role: 'member',
      })

      if (joinErr) throw joinErr

      toast.success(`🎉 Joined "${party.name}"!`)
      router.push('/party')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join party')
    } finally {
      setJoining(false)
    }
  }

  const typeLabel: Record<string, string> = { friends: '👥 Friends', couple: '💑 Couple', family: '👨‍👩‍👧 Family' }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">👥</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Loading party details...
          </div>
        </div>
      </div>
    )
  }

  if (error || !party) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080F' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>Party Not Found</h2>
          <p className="text-sm mb-6" style={{ color: '#9B99B8' }}>{error}</p>
          <button
            onClick={() => router.push('/party')}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: '#7C3AED', color: '#fff', fontFamily: 'Oxanium, sans-serif' }}
          >
            Go to Party Page
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#08080F' }}>
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div
          className="p-8 rounded-2xl text-center relative overflow-hidden"
          style={{ background: '#13131F', border: '1px solid #2E2E50', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: '#7C3AED' }}
          />

          <div className="relative">
            <div className="text-6xl mb-4">{party.emoji}</div>

            <div
              className="text-xs font-bold mb-2 px-3 py-1 rounded-full inline-block"
              style={{
                background: '#7C3AED22',
                color: '#9F67FF',
                fontFamily: 'Oxanium, sans-serif',
              }}
            >
              PARTY INVITE
            </div>

            <h1 className="text-2xl font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
              {party.name}
            </h1>

            <div className="flex items-center justify-center gap-4 mb-6 text-sm" style={{ color: '#9B99B8' }}>
              <span>{typeLabel[party.party_type] ?? party.party_type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {memberCount}/{party.max_members} members
              </span>
            </div>

            <p className="text-sm mb-8" style={{ color: '#9B99B8' }}>
              You&apos;ve been invited to join this party on Life RPG OS. Complete quests together and fight party bosses!
            </p>

            {memberCount >= party.max_members ? (
              <div
                className="flex items-center gap-2 justify-center p-3 rounded-xl text-sm"
                style={{ background: '#EF444422', color: '#EF4444' }}
              >
                <Shield size={16} />
                This party is full ({memberCount}/{party.max_members})
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all"
                style={{
                  background: joining ? '#5C5A7A' : '#7C3AED',
                  color: '#fff',
                  fontFamily: 'Oxanium, sans-serif',
                  boxShadow: joining ? 'none' : '0 0 25px #7C3AED44',
                }}
                onMouseEnter={(e) => { if (!joining) e.currentTarget.style.background = '#6D28D9' }}
                onMouseLeave={(e) => { if (!joining) e.currentTarget.style.background = '#7C3AED' }}
              >
                {joining ? 'Joining...' : (
                  <>Join Party ⚔️ <ArrowRight size={16} /></>
                )}
              </button>
            )}

            <button
              onClick={() => router.push('/party')}
              className="w-full mt-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: '#5C5A7A' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#9B99B8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5C5A7A')}
            >
              Maybe later
            </button>
          </div>
        </div>

        {/* Brand footer */}
        <div className="text-center mt-6">
          <span className="text-sm" style={{ color: '#5C5A7A' }}>
            ⚔️ <span style={{ fontFamily: 'Oxanium, sans-serif' }}>Life RPG OS</span> — Treat life like a game
          </span>
        </div>
      </motion.div>
    </div>
  )
}
