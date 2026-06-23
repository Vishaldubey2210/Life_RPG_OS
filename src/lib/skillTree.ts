export interface SkillNode {
  id: string
  tier: number
  name: string
  desc: string
  icon: string
  req_stat: number
  xp_bonus: number
  unlocks: string
}

export interface SkillTreeBranch {
  color: string
  icon: string
  label: string
  statKey: string
  nodes: SkillNode[]
}

export const SKILL_TREES: Record<string, SkillTreeBranch> = {
  strength: {
    color: '#EF4444',
    icon: '💪',
    label: 'Strength',
    statKey: 'str',
    nodes: [
      {
        id: 'str_1', tier: 1, name: 'Mover',
        desc: 'You started moving your body',
        icon: '🚶', req_stat: 0, xp_bonus: 0,
        unlocks: 'Complete any physical habit 1 time',
      },
      {
        id: 'str_2', tier: 2, name: 'Athlete in Training',
        desc: 'Building the habit of physical discipline',
        icon: '🏃', req_stat: 10, xp_bonus: 5,
        unlocks: 'Strength stat reaches 10',
      },
      {
        id: 'str_3', tier: 3, name: 'Iron Will',
        desc: 'Your body follows your mind now',
        icon: '🏋️', req_stat: 25, xp_bonus: 10,
        unlocks: 'Strength stat reaches 25',
      },
      {
        id: 'str_4', tier: 4, name: 'Beast Mode',
        desc: 'Physical peak — you inspire others',
        icon: '⚡', req_stat: 50, xp_bonus: 20,
        unlocks: 'Strength stat reaches 50',
      },
      {
        id: 'str_5', tier: 5, name: 'Legendary Warrior',
        desc: 'You have mastered physical discipline',
        icon: '👑', req_stat: 100, xp_bonus: 50,
        unlocks: 'Strength stat reaches 100',
      },
    ],
  },
  intelligence: {
    color: '#3B82F6',
    icon: '🧠',
    label: 'Intelligence',
    statKey: 'int',
    nodes: [
      {
        id: 'int_1', tier: 1, name: 'Curious Mind',
        desc: 'The spark of learning ignites',
        icon: '💡', req_stat: 0, xp_bonus: 0,
        unlocks: 'Always unlocked',
      },
      {
        id: 'int_2', tier: 2, name: 'Scholar',
        desc: 'Knowledge is your weapon',
        icon: '📚', req_stat: 10, xp_bonus: 5,
        unlocks: 'Intelligence reaches 10',
      },
      {
        id: 'int_3', tier: 3, name: 'Deep Thinker',
        desc: 'You see patterns others miss',
        icon: '🔭', req_stat: 25, xp_bonus: 10,
        unlocks: 'Intelligence reaches 25',
      },
      {
        id: 'int_4', tier: 4, name: 'Genius Mode',
        desc: 'Ideas flow through you constantly',
        icon: '⚡', req_stat: 50, xp_bonus: 20,
        unlocks: 'Intelligence reaches 50',
      },
      {
        id: 'int_5', tier: 5, name: 'Legendary Sage',
        desc: 'You have mastered the art of learning',
        icon: '👑', req_stat: 100, xp_bonus: 50,
        unlocks: 'Intelligence reaches 100',
      },
    ],
  },
  wisdom: {
    color: '#8B5CF6',
    icon: '🧘',
    label: 'Wisdom',
    statKey: 'wis',
    nodes: [
      {
        id: 'wis_1', tier: 1, name: 'Seeker',
        desc: 'You look inward for the first time',
        icon: '🌱', req_stat: 0, xp_bonus: 0,
        unlocks: 'Always unlocked',
      },
      {
        id: 'wis_2', tier: 2, name: 'Mindful',
        desc: 'Present in each moment',
        icon: '🕯️', req_stat: 10, xp_bonus: 5,
        unlocks: 'Wisdom reaches 10',
      },
      {
        id: 'wis_3', tier: 3, name: 'Inner Peace',
        desc: 'Chaos does not move you',
        icon: '☮️', req_stat: 25, xp_bonus: 10,
        unlocks: 'Wisdom reaches 25',
      },
      {
        id: 'wis_4', tier: 4, name: 'Enlightened',
        desc: 'Others seek your counsel',
        icon: '✨', req_stat: 50, xp_bonus: 20,
        unlocks: 'Wisdom reaches 50',
      },
      {
        id: 'wis_5', tier: 5, name: 'Legendary Monk',
        desc: 'Complete mastery of self',
        icon: '👑', req_stat: 100, xp_bonus: 50,
        unlocks: 'Wisdom reaches 100',
      },
    ],
  },
  vitality: {
    color: '#22C55E',
    icon: '❤️',
    label: 'Vitality',
    statKey: 'vit',
    nodes: [
      {
        id: 'vit_1', tier: 1, name: 'Alive',
        desc: 'You are paying attention to your body',
        icon: '💧', req_stat: 0, xp_bonus: 0,
        unlocks: 'Always unlocked',
      },
      {
        id: 'vit_2', tier: 2, name: 'Healthy Habits',
        desc: 'Body working for you now',
        icon: '🥗', req_stat: 10, xp_bonus: 5,
        unlocks: 'Vitality reaches 10',
      },
      {
        id: 'vit_3', tier: 3, name: 'Energized',
        desc: 'You wake up ready every day',
        icon: '⚡', req_stat: 25, xp_bonus: 10,
        unlocks: 'Vitality reaches 25',
      },
      {
        id: 'vit_4', tier: 4, name: 'Optimal',
        desc: 'Peak physical wellness achieved',
        icon: '🌟', req_stat: 50, xp_bonus: 20,
        unlocks: 'Vitality reaches 50',
      },
      {
        id: 'vit_5', tier: 5, name: 'Legendary Healer',
        desc: 'Your health inspires all',
        icon: '👑', req_stat: 100, xp_bonus: 50,
        unlocks: 'Vitality reaches 100',
      },
    ],
  },
  gold: {
    color: '#F59E0B',
    icon: '💰',
    label: 'Wealth',
    statKey: 'gold',
    nodes: [
      {
        id: 'gold_1', tier: 1, name: 'Aware',
        desc: 'You know where your money goes',
        icon: '👀', req_stat: 0, xp_bonus: 0,
        unlocks: 'Always unlocked',
      },
      {
        id: 'gold_2', tier: 2, name: 'Saver',
        desc: 'Building the foundation of wealth',
        icon: '🏦', req_stat: 10, xp_bonus: 5,
        unlocks: 'Wealth reaches 10',
      },
      {
        id: 'gold_3', tier: 3, name: 'Investor',
        desc: 'Money works for you now',
        icon: '📈', req_stat: 25, xp_bonus: 10,
        unlocks: 'Wealth reaches 25',
      },
      {
        id: 'gold_4', tier: 4, name: 'Wealthy',
        desc: 'Financial freedom in sight',
        icon: '💎', req_stat: 50, xp_bonus: 20,
        unlocks: 'Wealth reaches 50',
      },
      {
        id: 'gold_5', tier: 5, name: 'Legendary Merchant',
        desc: 'True financial mastery',
        icon: '👑', req_stat: 100, xp_bonus: 50,
        unlocks: 'Wealth reaches 100',
      },
    ],
  },
  charisma: {
    color: '#EC4899',
    icon: '🗣️',
    label: 'Charisma',
    statKey: 'cha',
    nodes: [
      {
        id: 'cha_1', tier: 1, name: 'Present',
        desc: 'You show up for people',
        icon: '🤝', req_stat: 0, xp_bonus: 0,
        unlocks: 'Always unlocked',
      },
      {
        id: 'cha_2', tier: 2, name: 'Connector',
        desc: 'People enjoy your company',
        icon: '💬', req_stat: 10, xp_bonus: 5,
        unlocks: 'Charisma reaches 10',
      },
      {
        id: 'cha_3', tier: 3, name: 'Influencer',
        desc: 'You move people with your words',
        icon: '🎯', req_stat: 25, xp_bonus: 10,
        unlocks: 'Charisma reaches 25',
      },
      {
        id: 'cha_4', tier: 4, name: 'Leader',
        desc: 'Others follow your energy',
        icon: '🌟', req_stat: 50, xp_bonus: 20,
        unlocks: 'Charisma reaches 50',
      },
      {
        id: 'cha_5', tier: 5, name: 'Legendary Orator',
        desc: 'Complete social mastery',
        icon: '👑', req_stat: 100, xp_bonus: 50,
        unlocks: 'Charisma reaches 100',
      },
    ],
  },
}

export const SKILL_TREE_ORDER = ['strength', 'intelligence', 'wisdom', 'vitality', 'gold', 'charisma']
