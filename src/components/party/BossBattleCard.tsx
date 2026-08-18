'use client'

import { motion } from 'framer-motion'
import { Crown, Swords, Trophy, Users } from 'lucide-react'

export interface BossBattleCardBoss {
  name: string
  description?: string | null
  emoji: string
  difficulty: 'normal' | 'hard' | 'legendary'
  target_completions: number
  current_completions: number
  bonus_xp_per_member: number
  end_date: string
}

export interface BossBattleContribution {
  user_id: string
  completions_count: number
  profiles?: { display_name: string; avatar_url?: string }
}

const difficulty = {
  normal: { label: 'Normal', color: '#22C55E' },
  hard: { label: 'Hard', color: '#F59E0B' },
  legendary: { label: 'Legendary', color: '#EF4444' },
}

export function BossBattleCard({
  boss,
  contributions = [],
}: {
  boss: BossBattleCardBoss
  contributions?: BossBattleContribution[]
}) {
  const remaining = Math.max(0, boss.target_completions - boss.current_completions)
  const hpPercent = boss.target_completions > 0 ? (remaining / boss.target_completions) * 100 : 0
  const daysRemaining = Math.max(0, Math.ceil((new Date(boss.end_date).getTime() - Date.now()) / 86400000))
  const config = difficulty[boss.difficulty]

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border p-6"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(8,8,15,0.95))', borderColor: '#EF444466', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-red-500 opacity-10 blur-3xl" />
        <div className="mb-5 flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl" style={{ background: '#EF444420', border: '2px solid #EF444450', filter: 'drop-shadow(0 0 10px #EF4444)' }}>{boss.emoji}</div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 font-display">Active raid</span>
              <span className="rounded-full border px-2 py-0.5 text-xs font-bold" style={{ background: `${config.color}20`, color: config.color, borderColor: `${config.color}50` }}>{config.label}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white font-display">{boss.name}</h2>
            {boss.description && <p className="mt-1 text-xs text-slate-400">{boss.description}</p>}
          </div>
          <div className="shrink-0 text-center"><div className="text-2xl font-black text-amber-400 font-display">{daysRemaining}</div><div className="text-[10px] text-slate-400">days left</div></div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs"><span className="font-bold text-red-400 font-display">BOSS HP</span><span className="font-bold text-red-400 font-display">{remaining} / {boss.target_completions}</span></div>
          <div className="h-4 overflow-hidden rounded-full border border-red-500/20 bg-slate-900"><motion.div className="h-full rounded-full" initial={{ width: '100%' }} animate={{ width: `${hpPercent}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ background: hpPercent > 60 ? 'linear-gradient(90deg, #EF4444, #DC2626)' : hpPercent > 30 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' : 'linear-gradient(90deg, #F59E0B, #FCD34D)', boxShadow: '0 0 12px rgba(239,68,68,0.5)' }} /></div>
          <p className="mt-1 text-[11px] text-slate-500">{boss.current_completions} quest completions dealt — {Math.round(100 - hpPercent)}% damage done</p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2"><Trophy size={14} className="text-amber-400" /><span className="text-xs font-bold text-amber-400 font-display">Victory Reward: +{boss.bonus_xp_per_member} XP per party member</span></div>
      </motion.section>
      <section className="rounded-2xl border border-slate-800 bg-[#13131F] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white font-display"><Users size={16} className="text-purple-400" /> Party Contributions</h3>
        {contributions.length === 0 ? <p className="text-xs text-slate-400">No contributions yet. Complete your daily quests to deal damage!</p> : <div className="space-y-3">{contributions.map((contribution, index) => { const name = contribution.profiles?.display_name ?? 'Adventurer'; return <div key={contribution.user_id} className="flex items-center gap-3"><div className="w-5 text-center text-xs font-bold text-slate-400">{index === 0 ? <Crown size={16} className="text-amber-400" /> : `#${index + 1}`}</div><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400 font-display">{name.charAt(0).toUpperCase()}</div><div className="flex-1"><div className="text-xs font-semibold text-white">{name}</div><div className="text-[11px] text-slate-400">{contribution.completions_count} damage dealt</div></div><span className="flex items-center gap-1 text-xs font-bold text-red-400 font-display"><Swords size={12} /> {contribution.completions_count}</span></div> })}</div>}
      </section>
    </div>
  )
}
