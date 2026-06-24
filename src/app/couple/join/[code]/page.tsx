'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Heart, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface PageProps {
  params: Promise<{ code: string }>
}

export default function CoupleJoinPage({ params }: PageProps) {
  const supabase = createClient()
  const router = useRouter()
  const [code, setCode] = useState<string>('')
  const [partnerName, setPartnerName] = useState<string>('')
  const [partnerAvatar, setPartnerAvatar] = useState<string>('💑')
  const [partnerLevel, setPartnerLevel] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkId, setLinkId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setCode(p.code))
  }, [params])

  useEffect(() => {
    if (!code) return

    async function fetchCouple() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push(`/login?redirect=/couple/join/${code}`)
          return
        }

        const { data: link, error: linkErr } = await supabase
          .from('couple_links')
          .select('*')
          .eq('invite_code', code.toUpperCase())
          .eq('status', 'pending')
          .single()

        if (linkErr || !link) {
          setError('Couple invite not found or already used.')
          setLoading(false)
          return
        }

        setLinkId(link.id)

        // Fetch partner profile
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('display_name, avatar_emoji, level')
          .eq('id', link.user_1)
          .single()

        if (partnerProfile) {
          setPartnerName(partnerProfile.display_name)
          setPartnerAvatar(partnerProfile.avatar_emoji)
          setPartnerLevel(partnerProfile.level)
        }
      } catch {
        setError('Failed to load couple invite.')
      } finally {
        setLoading(false)
      }
    }

    fetchCouple()
  }, [code, supabase, router])

  async function handleAccept() {
    if (!linkId) return
    setAccepting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { error: updateErr } = await supabase
        .from('couple_links')
        .update({ user_2: user.id, status: 'active' })
        .eq('id', linkId)

      if (updateErr) throw updateErr

      toast.success(`💑 Linked with ${partnerName}! Welcome to Couple Mode!`)
      router.push('/party/couple')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080F' }}>
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-5xl mb-4"
          >
            💑
          </motion.div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>
            Loading couple invite...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080F' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-xl font-bold mb-2 font-display" style={{ color: '#F1F0FF' }}>Invite Not Found</h2>
          <p className="text-sm mb-6" style={{ color: '#9B99B8' }}>{error}</p>
          <button
            onClick={() => router.push('/party/couple')}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: '#EC4899', color: '#fff', fontFamily: 'Oxanium, sans-serif' }}
          >
            Go to Couple Mode
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
        <div
          className="p-8 rounded-2xl text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1A0A1F, #13131F)',
            border: '1px solid #EC489944',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: '#EC4899' }}
          />

          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-2"
            >
              💑
            </motion.div>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-4xl">{partnerAvatar}</div>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Heart size={24} fill="#EC4899" style={{ color: '#EC4899' }} />
              </motion.div>
              <div className="text-4xl">❓</div>
            </div>

            <h1 className="text-2xl font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>
              {partnerName} wants to link up!
            </h1>
            <div className="text-sm mb-2" style={{ color: '#9B99B8' }}>
              Level {partnerLevel} Adventurer
            </div>

            <p className="text-sm mb-8" style={{ color: '#9B99B8' }}>
              Join {partnerName} on Life RPG OS to track habits together, share quests, and build your couple journey!
            </p>

            <div className="space-y-3">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all"
                style={{
                  background: accepting ? '#5C5A7A' : 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  color: '#fff',
                  fontFamily: 'Oxanium, sans-serif',
                  boxShadow: accepting ? 'none' : '0 0 25px #EC489944',
                }}
              >
                {accepting ? 'Linking...' : (
                  <>Accept &amp; Link Up 💑 <ArrowRight size={16} /></>
                )}
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: '#5C5A7A' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#9B99B8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#5C5A7A')}
              >
                Decline
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <span className="text-sm" style={{ color: '#5C5A7A' }}>
            ⚔️ <span style={{ fontFamily: 'Oxanium, sans-serif' }}>Life RPG OS</span> — Build habits together
          </span>
        </div>
      </motion.div>
    </div>
  )
}
