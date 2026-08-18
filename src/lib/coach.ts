export const COACH_SYSTEM_PROMPT = `You are an elite AI Life Coach inside "Life RPG OS" — a gamified life operating system where users earn XP, level up stats, and complete daily quests.

Your personality:
- Motivating but REAL — no toxic positivity
- Speak like a wise mentor who has seen people transform
- Reference the user's actual data (stats, level, streaks, habits, memory notes)
- Use RPG metaphors naturally (quests, stats, leveling up, boss battles, skill trees)
- Keep responses concise and impactful — 3-4 paragraphs max unless asked for deep strategy
- End every response with ONE specific, high-leverage action the user should take today

You have access to the user's:
- Level and total XP
- All 6 stat values (STR/INT/WIS/VIT/GOLD/CHA)
- Current streaks per habit
- Recent completions (last 7 days)
- Long-term coach memories (patterns, goals, struggles, personality traits)

Use this data to give hyper-personalized advice. Never give generic advice. Always reference their specific context.`

export interface CoachMemoryItem {
  id?: string
  memory_type: 'pattern' | 'preference' | 'goal' | 'struggle' | 'milestone' | 'personality' | 'insight'
  content: string
  importance: number
}

interface Profile {
  display_name: string
  level: number
  current_xp?: number
  xp?: number
  xp_to_next?: number
  hp?: number
  streak_days?: number
  streak?: number
  personality_type?: Record<string, unknown>
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
  id?: string
  name: string
  category?: string
  stat_category?: string
  difficulty?: string
  xp_reward?: number
  scheduled_time?: string
  duration_minutes?: number
}

interface Completion {
  completed_date?: string
  completed_at?: string
}

export function buildUserContext(
  profile: Profile,
  stats: Stats,
  habits: Habit[],
  completions: Completion[],
  memories: CoachMemoryItem[] = []
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

  const memorySection = memories.length > 0
    ? `\nCOACH LONG-TERM MEMORIES & USER PATTERNS:\n${memories.map((m) => `- [${m.memory_type.toUpperCase()}] (${m.importance}/10): ${m.content}`).join('\n')}`
    : ''

  return `
PLAYER DATA:
- Name: ${profile.display_name}
- Level: ${profile.level} (${currentXP}/${xpToNext} XP)
- HP: ${profile.hp ?? 100}/100
- Streak: ${streakDays} days
- Personality Profile: ${JSON.stringify(profile.personality_type ?? {})}

STATS:
- Strength: ${stats.str ?? stats.strength ?? 0}
- Intelligence: ${stats.int ?? stats.intelligence ?? 0}
- Wisdom: ${stats.wis ?? stats.wisdom ?? 0}
- Vitality: ${stats.vit ?? stats.vitality ?? 0}
- Gold: ${stats.gold ?? 0}
- Charisma: ${stats.cha ?? 0}

ACTIVE QUESTS (${habits.length} total):
${habits.map((h) => `- ${h.name} (${h.stat_category ?? h.category ?? 'str'}, ${h.difficulty ?? 'easy'}, ${h.xp_reward ?? 10}XP${h.scheduled_time ? `, at ${h.scheduled_time}` : ''})`).join('\n')}

LAST 7 DAYS — Completions: ${last7Days.length} out of ${Math.max(habits.length * 7, 1)} possible
${memorySection}
`
}
