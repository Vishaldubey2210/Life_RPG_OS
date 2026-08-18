'use client'

interface XPCardProps {
  displayName: string
  avatarEmoji: string
  level: number
  totalXp: number
  streakDays: number
  stats: {
    strength: number
    intelligence: number
    wisdom: number
    vitality: number
    gold: number
    charisma: number
  }
}

export function XPCard({
  displayName,
  avatarEmoji,
  level,
  totalXp,
  streakDays,
  stats,
}: XPCardProps) {
  const statList = [
    { label: 'STR', val: stats.strength, color: '#EF4444' },
    { label: 'INT', val: stats.intelligence, color: '#3B82F6' },
    { label: 'WIS', val: stats.wisdom, color: '#8B5CF6' },
    { label: 'VIT', val: stats.vitality, color: '#22C55E' },
    { label: 'GOLD', val: stats.gold, color: '#F59E0B' },
    { label: 'CHA', val: stats.charisma, color: '#EC4899' },
  ]

  return (
    <div
      style={{
        width: 400,
        height: 700,
        background: '#08080F',
        border: '2px solid #7C3AED',
        borderRadius: 24,
        padding: 32,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        boxShadow: '0 0 40px rgba(124,58,237,0.3)',
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
          fontFamily: "'Oxanium', sans-serif",
          letterSpacing: '0.05em',
        }}
      >
        LIFE RPG OS
      </div>

      {/* Avatar */}
      <div style={{ fontSize: 64, marginTop: 24 }}>{avatarEmoji || '👑'}</div>

      {/* Name + Level */}
      <div
        style={{
          color: '#F1F0FF',
          fontSize: 26,
          fontWeight: 700,
          marginTop: 12,
          fontFamily: "'Oxanium', sans-serif",
        }}
      >
        {displayName}
      </div>
      <div
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #9F67FF)',
          color: 'white',
          padding: '4px 16px',
          borderRadius: 20,
          fontSize: 14,
          fontWeight: 700,
          marginTop: 8,
          fontFamily: "'Oxanium', sans-serif",
          boxShadow: '0 0 15px rgba(124,58,237,0.4)',
        }}
      >
        Level {level}
      </div>

      {/* XP */}
      <div
        style={{
          color: '#F59E0B',
          fontSize: 40,
          fontWeight: 800,
          marginTop: 20,
          fontFamily: "'Oxanium', sans-serif",
          textShadow: '0 0 20px rgba(245,158,11,0.3)',
        }}
      >
        {totalXp.toLocaleString()} XP
      </div>

      {/* Stats */}
      <div
        style={{
          marginTop: 24,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {statList.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                color: item.color,
                fontSize: 12,
                fontWeight: 700,
                width: 45,
                fontFamily: "'Oxanium', sans-serif",
              }}
            >
              {item.label}
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
                  width: `${Math.min(item.val, 100)}%`,
                  height: '100%',
                  background: item.color,
                  borderRadius: 4,
                }}
              />
            </div>
            <span
              style={{
                color: '#F1F0FF',
                fontSize: 12,
                width: 28,
                textAlign: 'right',
                fontFamily: "'Oxanium', sans-serif",
              }}
            >
              {item.val}
            </span>
          </div>
        ))}
      </div>

      {/* Streak */}
      <div
        style={{
          marginTop: 20,
          color: '#F59E0B',
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "'Oxanium', sans-serif",
        }}
      >
        {streakDays} Day Streak 🔥
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 'auto',
          color: '#5C5A7A',
          fontSize: 12,
          fontFamily: "'Oxanium', sans-serif",
        }}
      >
        life-rpg-os.com • Start your adventure
      </div>
    </div>
  )
}
