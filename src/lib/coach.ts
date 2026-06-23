export const COACH_SYSTEM_PROMPT = `You are an elite AI Life Coach inside "Life RPG OS" — a gamified life system where users earn XP, level up stats, and complete daily quests.

Your personality:
- Motivating but REAL — no toxic positivity
- Speak like a wise mentor who has seen people transform
- Reference the user's actual data (stats, level, streaks, habits)
- Use RPG metaphors naturally (quests, stats, leveling up, boss battles)
- Keep responses concise — 3-4 paragraphs max unless asked for more
- End every response with ONE specific action the user should take today

You have access to the user's:
- Level and total XP
- All 6 stat values (STR/INT/WIS/VIT/GOLD/CHA)
- Current streaks per habit
- Recent completions (last 7 days)
- Goals they set during onboarding

Use this data to give hyper-personalized advice.
Never give generic advice. Always reference their specific numbers.`

interface Profile {
  display_name: string
  level: number
  current_xp?: number
  xp?: number
  xp_to_next?: number
  hp?: number
  streak_days?: number
  streak?: number
}

interface Stats {
  str?: number
  int?: number
  wis?: number
  vit?: number
  gold?: number
  cha?: number
  strength?: number
  intelligence?: number
  wisdom?: number
  vitality?: number
}

interface Habit {
  name: string
  category?: string
  stat_category?: string
  difficulty?: string
  xp_reward?: number
}

interface Completion {
  completed_date?: string
  completed_at?: string
}

export function buildUserContext(
  profile: Profile,
  stats: Stats,
  habits: Habit[],
  completions: Completion[]
): string {
  const last7Days = completions.filter((c) => {
    const dateStr = c.completed_date ?? c.completed_at?.split('T')[0] ?? ''
    const d = new Date(dateStr)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  })

  const streakDays = profile.streak_days ?? profile.streak ?? 0
  const currentXP = profile.current_xp ?? profile.xp ?? 0
  const xpToNext = profile.xp_to_next ?? 100

  return `
PLAYER DATA:
- Name: ${profile.display_name}
- Level: ${profile.level} (${currentXP}/${xpToNext} XP)
- HP: ${profile.hp ?? 100}/100
- Streak: ${streakDays} days

STATS:
- Strength: ${stats.str ?? stats.strength ?? 0}
- Intelligence: ${stats.int ?? stats.intelligence ?? 0}
- Wisdom: ${stats.wis ?? stats.wisdom ?? 0}
- Vitality: ${stats.vit ?? stats.vitality ?? 0}
- Gold: ${stats.gold ?? 0}
- Charisma: ${stats.cha ?? 0}

ACTIVE QUESTS (${habits.length} total):
${habits.map((h) => `- ${h.name} (${h.stat_category ?? h.category ?? 'unknown'}, ${h.difficulty ?? 'easy'}, ${h.xp_reward ?? 10}XP)`).join('\n')}

LAST 7 DAYS — Completions: ${last7Days.length} out of ${habits.length * 7} possible
`
}
