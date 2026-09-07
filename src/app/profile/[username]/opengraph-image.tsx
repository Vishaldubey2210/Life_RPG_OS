import { ImageResponse } from '@vercel/og'
import { createClient } from '@/lib/supabase/server'

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, stats(*)')
    .eq('username', username)
    .single()

  const displayName = profile?.display_name || username || 'Adventurer'
  const level = profile?.level || 1
  const totalXp = profile?.total_xp || 0
  const streakDays = profile?.streak_days || 0

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#08080F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
          border: '4px solid #7C3AED',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 32, right: 40, color: '#5C5A7A', fontSize: 18, fontWeight: 700 }}>
          Life RPG OS
        </div>

        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: 'rgba(124,58,237,0.2)',
            border: '2px solid #7C3AED',
            color: '#9F67FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 16,
          }}
        >
          LV.{level}
        </div>

        <div
          style={{
            color: '#F1F0FF',
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          {displayName}
        </div>

        <div
          style={{
            background: '#7C3AED',
            color: 'white',
            padding: '6px 24px',
            borderRadius: 30,
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          Level {level} • {totalXp.toLocaleString()} XP
        </div>

        <div style={{ color: '#F59E0B', fontSize: 28, fontWeight: 700 }}>
          {streakDays} Day Streak
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
