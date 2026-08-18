'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  X,
  Zap,
  Clock,
  Dumbbell,
  Brain,
  Wind,
  Heart,
  Coins,
  Mic2,
  LucideIcon,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

export interface HabitTemplateItem {
  name: string
  category: string
  difficulty: string
  duration: number
  xp_reward: number
  scheduled_time?: string
  implementation_intention?: string
}

export interface HabitPack {
  id: string
  name: string
  emoji: string
  description: string
  category: string
  habits: HabitTemplateItem[]
  downloads: number
  tags: string[]
  color: string
}

const HABIT_TEMPLATES: HabitPack[] = [
  {
    id: 'student-grind',
    name: 'Student Grind Pack',
    emoji: '📚',
    description: 'Built for students preparing for high-stakes exams, placements, and coding interviews.',
    category: 'productivity',
    color: '#3B82F6',
    habits: [
      {
        name: 'Deep Study Session',
        category: 'int',
        difficulty: 'hard',
        duration: 120,
        xp_reward: 50,
        scheduled_time: '10:00',
        implementation_intention: 'When I sit at my desk, I will study for 2 focused hours.',
      },
      {
        name: 'Read 20 Pages Non-Fiction',
        category: 'int',
        difficulty: 'medium',
        duration: 30,
        xp_reward: 25,
      },
      {
        name: 'Revise Yesterday Notes',
        category: 'int',
        difficulty: 'easy',
        duration: 20,
        xp_reward: 10,
      },
      {
        name: 'No Phone After 10PM',
        category: 'wis',
        difficulty: 'hard',
        duration: 0,
        xp_reward: 50,
      },
      {
        name: 'Sleep by 11PM',
        category: 'vit',
        difficulty: 'medium',
        duration: 0,
        xp_reward: 25,
      },
    ],
    downloads: 1420,
    tags: ['student', 'exams', 'focus', 'placement'],
  },
  {
    id: 'fitness-beginner',
    name: 'Fitness Starter Protocol',
    emoji: '💪',
    description: 'Go from zero to unstoppable consistency in 30 days without burnout.',
    category: 'fitness',
    color: '#EF4444',
    habits: [
      {
        name: 'Morning Brisk Walk',
        category: 'str',
        difficulty: 'easy',
        duration: 30,
        xp_reward: 10,
        scheduled_time: '07:00',
      },
      {
        name: 'Strength Workout / Calisthenics',
        category: 'str',
        difficulty: 'hard',
        duration: 45,
        xp_reward: 50,
        scheduled_time: '08:00',
      },
      {
        name: 'Drink 3L Clean Water',
        category: 'vit',
        difficulty: 'easy',
        duration: 0,
        xp_reward: 10,
      },
      {
        name: 'Zero Junk Food / Refined Sugar',
        category: 'vit',
        difficulty: 'medium',
        duration: 0,
        xp_reward: 25,
      },
      {
        name: 'Sleep 8 Restorative Hours',
        category: 'vit',
        difficulty: 'medium',
        duration: 0,
        xp_reward: 25,
      },
    ],
    downloads: 2180,
    tags: ['fitness', 'gym', 'health', 'strength'],
  },
  {
    id: 'entrepreneur-os',
    name: 'Founder & Builder Daily OS',
    emoji: '🚀',
    description: 'The daily operating system used by high-output startup founders and solopreneurs.',
    category: 'business',
    color: '#F59E0B',
    habits: [
      {
        name: 'Morning Journal & Daily Prioritization',
        category: 'wis',
        difficulty: 'medium',
        duration: 20,
        xp_reward: 25,
        scheduled_time: '06:30',
      },
      {
        name: 'Deep Work Sprint (No Distractions)',
        category: 'int',
        difficulty: 'legendary',
        duration: 120,
        xp_reward: 100,
        scheduled_time: '09:00',
      },
      {
        name: 'Track Revenue, Burn & Key Metrics',
        category: 'gold',
        difficulty: 'easy',
        duration: 10,
        xp_reward: 10,
      },
      {
        name: 'Read Tech / Industry Insights',
        category: 'int',
        difficulty: 'easy',
        duration: 15,
        xp_reward: 10,
      },
      {
        name: 'Networking & Cold Outreach',
        category: 'cha',
        difficulty: 'medium',
        duration: 20,
        xp_reward: 25,
      },
    ],
    downloads: 980,
    tags: ['founder', 'startup', 'productivity', 'deep work'],
  },
  {
    id: 'mental-peace',
    name: 'Inner Peace & Stoic Protocol',
    emoji: '🧘',
    description: 'Reduce cortisol, eliminate anxiety, and build unshakeable mental clarity.',
    category: 'wellness',
    color: '#8B5CF6',
    habits: [
      {
        name: '15-Minute Mindfulness Meditation',
        category: 'wis',
        difficulty: 'easy',
        duration: 15,
        xp_reward: 10,
        scheduled_time: '07:00',
      },
      {
        name: 'Gratitude Reflection & Stoic Journal',
        category: 'wis',
        difficulty: 'easy',
        duration: 10,
        xp_reward: 10,
      },
      {
        name: 'Zero Social Media Before 10 AM',
        category: 'wis',
        difficulty: 'hard',
        duration: 0,
        xp_reward: 50,
      },
      {
        name: 'Sunset Nature Walk',
        category: 'vit',
        difficulty: 'easy',
        duration: 25,
        xp_reward: 10,
        scheduled_time: '18:00',
      },
      {
        name: 'Digital Sunset (No Screens 1h Pre-Sleep)',
        category: 'wis',
        difficulty: 'hard',
        duration: 0,
        xp_reward: 50,
      },
    ],
    downloads: 1650,
    tags: ['mental health', 'anxiety', 'mindfulness', 'peace'],
  },
  {
    id: 'wealth-builder',
    name: 'Wealth Compounder System',
    emoji: '💰',
    description: 'Daily financial hygiene and discipline habits that build long-term freedom.',
    category: 'finance',
    color: '#10B981',
    habits: [
      {
        name: 'Log Daily Expenses',
        category: 'gold',
        difficulty: 'easy',
        duration: 5,
        xp_reward: 10,
      },
      {
        name: 'No Impulse Purchases (24h Rule)',
        category: 'gold',
        difficulty: 'hard',
        duration: 0,
        xp_reward: 50,
      },
      {
        name: 'Read 10 Pages of Financial Education',
        category: 'int',
        difficulty: 'easy',
        duration: 15,
        xp_reward: 10,
      },
      {
        name: 'Execute Automated Savings / DCA',
        category: 'gold',
        difficulty: 'medium',
        duration: 5,
        xp_reward: 25,
      },
      {
        name: 'Review Portfolio & Budget',
        category: 'gold',
        difficulty: 'easy',
        duration: 10,
        xp_reward: 10,
      },
    ],
    downloads: 1120,
    tags: ['money', 'investing', 'savings', 'wealth'],
  },
  {
    id: 'social-beast',
    name: 'Charisma & Social Magnetism',
    emoji: '🗣️',
    description: 'Master interpersonal influence, executive presence, and genuine relationship building.',
    category: 'social',
    color: '#EC4899',
    habits: [
      {
        name: 'Initiate 1 Meaningful Conversation',
        category: 'cha',
        difficulty: 'hard',
        duration: 0,
        xp_reward: 50,
      },
      {
        name: 'Call a Friend or Family Member',
        category: 'cha',
        difficulty: 'medium',
        duration: 15,
        xp_reward: 25,
      },
      {
        name: 'Give 1 Sincere, Specific Compliment',
        category: 'cha',
        difficulty: 'easy',
        duration: 0,
        xp_reward: 10,
      },
      {
        name: 'Publish Insights / Thought Leadership',
        category: 'cha',
        difficulty: 'medium',
        duration: 15,
        xp_reward: 25,
      },
      {
        name: 'Practice Active Listening in Meetings',
        category: 'cha',
        difficulty: 'easy',
        duration: 0,
        xp_reward: 10,
      },
    ],
    downloads: 870,
    tags: ['charisma', 'networking', 'communication', 'leadership'],
  },
]

const STAT_ICONS: Record<string, LucideIcon> = {
  str: Dumbbell,
  int: Brain,
  wis: Wind,
  vit: Heart,
  gold: Coins,
  cha: Mic2,
}

const CATEGORY_TABS = [
  { key: 'all', label: 'All Packs' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'business', label: 'Business' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'finance', label: 'Finance' },
  { key: 'social', label: 'Social & Charisma' },
]

export default function TemplatesPage() {
  const { profile } = useProfile()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activePack, setActivePack] = useState<HabitPack | null>(null)
  const [installing, setInstalling] = useState(false)
  const [installedPacks, setInstalledPacks] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadInstalled() {
      if (!profile?.id) return
      const { data } = await supabase
        .from('template_downloads')
        .select('template_id')
        .eq('user_id', profile.id)
      if (data) {
        setInstalledPacks(data.map((d: { template_id: string }) => d.template_id))
      }
    }
    loadInstalled()
  }, [profile?.id, supabase])

  const filteredPacks = selectedCategory === 'all'
    ? HABIT_TEMPLATES
    : HABIT_TEMPLATES.filter((p) => p.category === selectedCategory)

  async function handleInstallPack(pack: HabitPack) {
    if (!profile?.id) {
      toast.error('Please sign in to install this quest pack!')
      return
    }

    setInstalling(true)
    try {
      // 1. Insert habits
      const rowsToInsert = pack.habits.map((h) => ({
        user_id: profile.id,
        name: h.name,
        stat_category: h.category,
        difficulty: h.difficulty,
        xp_reward: h.xp_reward,
        scheduled_time: h.scheduled_time ?? null,
        duration_minutes: h.duration ?? 0,
        implementation_intention: h.implementation_intention ?? null,
        template_id: pack.id,
        is_active: true,
      }))

      const { error: insertError } = await supabase.from('habits').insert(rowsToInsert)
      if (insertError) throw insertError

      // 2. Track download
      await supabase.from('template_downloads').insert({
        template_id: pack.id,
        user_id: profile.id,
      })

      setInstalledPacks((prev) => [...prev, pack.id])
      toast.success(`${pack.habits.length} quests added to your board! +Quest Pack Unlocked 🎯`)
      setActivePack(null)
    } catch (err) {
      console.error('Install pack error:', err)
      toast.error('Failed to add quest pack. Please try again.')
    } finally {
      setInstalling(false)
    }
  }

  function handleShare(pack: HabitPack) {
    const url = `${window.location.origin}/templates#${pack.id}`
    if (navigator.share) {
      navigator.share({
        title: `${pack.name} — Life RPG OS`,
        text: `Level up with the "${pack.name}" on Life RPG OS! ⚔️`,
        url,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Pack link copied to clipboard!')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#08080F]">
      <Sidebar />

      <main className="flex-1 md:ml-60 p-4 md:p-8 max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 font-display mb-2">
            <Package size={14} />
            <span>Habit Marketplace</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display tracking-tight">
            Curated Quest Packs
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Battle-tested habit systems designed for peak performance, stoic balance, and accelerated character growth. Install with one click.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORY_TABS.map((tab) => {
            const active = selectedCategory === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 font-display"
                style={{
                  background: active ? '#7C3AED' : '#13131F',
                  color: active ? '#fff' : '#9B99B8',
                  border: `1px solid ${active ? '#7C3AED' : '#1E1E35'}`,
                  boxShadow: active ? '0 0 15px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPacks.map((pack) => {
            const isInstalled = installedPacks.includes(pack.id)
            const totalXP = pack.habits.reduce((sum, h) => sum + h.xp_reward, 0)

            return (
              <motion.div
                key={pack.id}
                id={pack.id}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-200"
                style={{
                  background: '#13131F',
                  borderColor: '#1E1E35',
                }}
              >
                {/* Glow pill */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-15"
                  style={{ background: pack.color }}
                />

                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        background: `${pack.color}18`,
                        border: `1px solid ${pack.color}33`,
                      }}
                    >
                      {pack.emoji}
                    </div>

                    <button
                      onClick={() => handleShare(pack)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Share pack"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white font-display mb-1.5">
                    {pack.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {pack.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-display flex items-center gap-1">
                      <Zap size={11} /> {totalXP} XP/day
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {pack.habits.length} Quests
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      {pack.downloads} uses
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => setActivePack(pack)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-white transition-colors"
                  >
                    View Quests
                  </button>
                  <button
                    onClick={() => handleInstallPack(pack)}
                    disabled={isInstalled}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all font-display"
                    style={{
                      background: isInstalled ? '#22C55E22' : '#7C3AED',
                      color: isInstalled ? '#22C55E' : '#fff',
                      border: isInstalled ? '1px solid #22C55E44' : 'none',
                    }}
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle2 size={13} /> Active
                      </>
                    ) : (
                      <>
                        <Download size={13} /> Use Pack
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Pack Details Modal */}
        <AnimatePresence>
          {activePack && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#13131F] p-6 shadow-2xl max-h-[85vh] flex flex-col"
              >
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activePack.emoji}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white font-display">
                        {activePack.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activePack.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePack(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
                    Included Daily Quests ({activePack.habits.length})
                  </p>
                  {activePack.habits.map((habit, idx) => {
                    const StatIcon = STAT_ICONS[habit.category] || Shield
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-800 bg-[#0F0F1A] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                            <StatIcon size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {habit.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                              <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {habit.difficulty}
                              </span>
                              {habit.duration > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> {habit.duration}m
                                </span>
                              )}
                              {habit.scheduled_time && (
                                <span className="text-amber-400">
                                  @{habit.scheduled_time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-purple-400 font-display flex items-center gap-1 flex-shrink-0">
                          <Zap size={12} /> +{habit.xp_reward} XP
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                  <button
                    onClick={() => setActivePack(null)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleInstallPack(activePack)}
                    disabled={installing || installedPacks.includes(activePack.id)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 font-display disabled:opacity-60"
                  >
                    {installedPacks.includes(activePack.id) ? (
                      <>
                        <CheckCircle2 size={16} /> Already Active
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        {installing ? 'Adding Quests...' : 'Use This Pack ⚔️'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
