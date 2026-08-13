import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface InvitePageProps {
  params: Promise<{ code: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params
  const supabase = await createClient()

  const { data: inviter } = await supabase
    .from('profiles')
    .select('*, stats(*)')
    .eq('referral_code', code)
    .single()

  if (!inviter) {
    notFound()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#08080F',
        color: '#F1F0FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#13131F',
          border: '1px solid #7C3AED',
          borderRadius: 24,
          padding: 40,
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 50px rgba(124,58,237,0.25)',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚔️</div>
        <h1
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: '#F1F0FF',
            marginBottom: 12,
          }}
        >
          {inviter.display_name || inviter.username || 'Adventurer'} challenged you!
        </h1>
        <p style={{ color: '#9B99B8', fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
          Level up your life on Life RPG OS. Join them and you <strong style={{ color: '#F59E0B' }}>BOTH get 200 bonus XP</strong>!
        </p>

        {/* Inviter Card Preview */}
        <div
          style={{
            background: '#1A1A2E',
            border: '1px solid #2E2E50',
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 40 }}>{inviter.avatar_emoji || '⚔️'}</div>
          <div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 16 }}>
              {inviter.display_name}
            </div>
            <div style={{ color: '#7C3AED', fontSize: 13, fontWeight: 600 }}>
              Level {inviter.level || 1} • {inviter.total_xp || 0} XP
            </div>
            <div style={{ color: '#F59E0B', fontSize: 12, marginTop: 4 }}>
              🔥 {inviter.streak_days || 0} Day Streak
            </div>
          </div>
        </div>

        <Link
          href={`/login?ref=${code}`}
          style={{
            display: 'block',
            width: '100%',
            padding: '16px 0',
            background: 'linear-gradient(135deg, #7C3AED, #9F67FF)',
            color: 'white',
            borderRadius: 12,
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 0 24px rgba(124,58,237,0.4)',
          }}
        >
          Accept Challenge ⚔️
        </Link>
      </div>
    </div>
  )
}
