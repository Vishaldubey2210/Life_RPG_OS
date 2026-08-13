import { ImageResponse } from '@vercel/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Achievement Unlocked'
  const emoji = searchParams.get('emoji') || '🏆'
  const desc = searchParams.get('desc') || 'Completed a legendary quest'
  const username = searchParams.get('username') || 'Adventurer'

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
          padding: 40,
          border: '4px solid #F59E0B',
          borderRadius: 24,
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 20, right: 24, color: '#5C5A7A', fontSize: 14 }}>
          ⚔️ Life RPG OS
        </div>

        <div style={{ fontSize: 96, marginBottom: 16 }}>{emoji}</div>

        <div
          style={{
            color: '#F59E0B',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          LEGENDARY ACHIEVEMENT UNLOCKED
        </div>

        <div
          style={{
            color: '#F1F0FF',
            fontSize: 36,
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: '#9B99B8',
            fontSize: 18,
            textAlign: 'center',
            maxWidth: 500,
            marginBottom: 28,
          }}
        >
          {desc}
        </div>

        <div
          style={{
            background: '#1A1A2E',
            border: '1px solid #7C3AED',
            padding: '8px 24px',
            borderRadius: 20,
            color: '#9F67FF',
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          Unlocked by {username} ⚔️
        </div>
      </div>
    ),
    { width: 800, height: 500 }
  )
}
