type Difficulty = 'easy' | 'medium' | 'hard' | 'legendary'

interface DifficultyBadgeProps {
  difficulty: Difficulty | string
}

const CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  easy:      { label: 'Easy',      bg: '#22C55E22', color: '#22C55E' },
  medium:    { label: 'Medium',    bg: '#3B82F622', color: '#3B82F6' },
  hard:      { label: 'Hard',      bg: '#7C3AED22', color: '#9F67FF' },
  legendary: { label: 'Legendary', bg: '#F59E0B22', color: '#F59E0B' },
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const key = difficulty.toLowerCase()
  const cfg = CONFIG[key] ?? CONFIG.easy

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}
