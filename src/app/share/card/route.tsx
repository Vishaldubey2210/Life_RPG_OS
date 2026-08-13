import { ImageResponse } from '@vercel/og'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return new Response('Username parameter required', { status: 400 })
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, stats(*)')
    .eq('username', username)
    .single()

  const displayName = profile?.display_name || username || 'Adventurer'
  const avatarEmoji = profile?.avatar_emoji || '⚔️'
  const level = profile?.level || 1
  const totalXp = profile?.total_xp || 0
  const streakDays = profile?.streak_days || 0
  const stats = profile?.stats || { strength: 10, intelligence: 10, wisdom: 10, vitality: 10, gold: 10, charisma: 10 }

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
          padding: 32,
          border: '2px solid #7C3AED',
          borderRadius: 24,
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            color: '#5C5A7A',
            fontSize: 12,
          }}
        >
          ⚔️ Life RPG OS
        </div>

        {/* Avatar */}
        <div style={{ fontSize: 72, marginTop: 24 }}>{avatarEmoji}</div>

        {/* Name + Level */}
        <div
          style={{
            color: '#F1F0FF',
            fontSize: 28,
            fontWeight: 700,
            marginTop: 12,
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            background: '#7C3AED',
            color: 'white',
            padding: '4px 16px',
            borderRadius: 20,
            fontSize: 14,
            marginTop: 8,
          }}
        >
          Level {level}
        </div>

        {/* XP */}
        <div
          style={{
            color: '#F59E0B',
            fontSize: 48,
            fontWeight: 800,
            marginTop: 20,
          }}
        >
          ⚡ {totalXp.toLocaleString()} XP
        </div>

        {/* Stats */}
        <div
          style={{
            marginTop: 24,
            width: '100%',
            gap: 8,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {[
            ['💪 STR', stats?.strength || 10, '#EF4444'],
            ['🧠 INT', stats?.intelligence || 10, '#3B82F6'],
            ['🧘 WIS', stats?.wisdom || 10, '#8B5CF6'],
            ['❤️ VIT', stats?.vitality || 10, '#22C55E'],
            ['💰 GOLD', stats?.gold || 10, '#F59E0B'],
            ['🗣️ CHA', stats?.charisma || 10, '#EC4899'],
          ].map(([label, val, color]) => (
            <div
              key={label as string}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ color: '#9B99B8', fontSize: 12, width: 60 }}>
                {label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: '#1E1E35',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(((val as number) / 100) * 100, 100)}%`,
                    height: '100%',
                    background: color as string,
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ color: '#F1F0FF', fontSize: 12, width: 24 }}>
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* Streak */}
        <div style={{ marginTop: 20, color: '#F59E0B', fontSize: 20 }}>
          🔥 {streakDays} Day Streak
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', color: '#5C5A7A', fontSize: 11 }}>
          life-rpg-os.com • Start your adventure
        </div>
      </div>
    ),
    { width: 400, height: 700 }
  )
}
