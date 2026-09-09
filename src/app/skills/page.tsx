'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TreePine,
  Dumbbell,
  Brain,
  Wind,
  Heart,
  Coins,
  Mic2,
  Sparkles,
  Lock,
  Target,
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useProfile } from '@/hooks/useProfile'
import { SKILL_TREES, SKILL_TREE_ORDER, SkillNode } from '@/lib/skillTree'
import { Stats } from '@/hooks/useProfile'

const BRANCH_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  strength: Dumbbell,
  intelligence: Brain,
  wisdom: Wind,
  vitality: Heart,
  wealth: Coins,
  charisma: Mic2,
}

const NODE_SIZE = 80
const NODE_GAP = 120

function getStatValue(stats: Stats | null, statKey: string): number {
  if (!stats) return 0
  return (stats as unknown as Record<string, number>)[statKey] ?? 0
}

function isNodeUnlocked(node: SkillNode, statVal: number): boolean {
  return statVal >= node.req_stat
}

interface NodeTooltipProps {
  node: SkillNode
  color: string
  unlocked: boolean
}

function NodeTooltip({ node, color, unlocked }: NodeTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      className="absolute left-1/2 bottom-full mb-3 z-20 w-56 rounded-2xl p-3.5 pointer-events-none bg-white border border-[#EAE6DD] shadow-xl"
      style={{
        transform: 'translateX(-50%)',
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg">{node.icon}</span>
        <span
          className="font-bold text-sm"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: unlocked ? color : '#232019' }}
        >
          {node.name}
        </span>
      </div>
      <p className="text-xs mb-2 text-[#6E6A61]">
        {node.desc}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#8A857A]">Unlocks at</span>
        <span style={{ color: unlocked ? color : '#EF4444', fontWeight: 600 }}>
          {node.req_stat === 0 ? 'Always' : `${node.req_stat} stat pts`}
        </span>
      </div>
      {node.xp_bonus > 0 && (
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-[#8A857A]">XP Bonus</span>
          <span className="font-bold text-[#5B57F0]">
            +{node.xp_bonus} XP
          </span>
        </div>
      )}
      {/* tooltip arrow */}
      <div
        className="absolute left-1/2 bottom-[-5px] w-2.5 h-2.5 rotate-45 bg-white border-r border-b border-[#EAE6DD]"
        style={{ transform: 'translateX(-50%) rotate(45deg)' }}
      />
    </motion.div>
  )
}

interface SkillNodeCircleProps {
  node: SkillNode
  color: string
  statVal: number
  isCurrent: boolean
}

function SkillNodeCircle({ node, color, statVal, isCurrent }: SkillNodeCircleProps) {
  const [hovered, setHovered] = useState(false)
  const unlocked = isNodeUnlocked(node, statVal)

  return (
    <div className="relative flex flex-col items-center" style={{ width: NODE_SIZE + 32 }}>
      <AnimatePresence>
        {hovered && <NodeTooltip node={node} color={color} unlocked={unlocked} />}
      </AnimatePresence>

      <motion.div
        className="relative flex items-center justify-center rounded-full cursor-pointer select-none transition-shadow duration-200"
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          background: unlocked ? `${color}18` : '#FAF8F5',
          border: `2px solid ${unlocked ? color : '#EAE6DD'}`,
          boxShadow: unlocked ? `0 4px 14px ${color}33` : '0 2px 6px rgba(0,0,0,0.03)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={
          isCurrent
            ? { boxShadow: [`0 0 0 0 ${color}66`, `0 0 0 10px ${color}00`] }
            : {}
        }
        transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
      >
        <div className="flex items-center justify-center" style={{ filter: unlocked ? 'none' : 'grayscale(1) opacity(0.4)', color: unlocked ? color : '#8A857A' }}>
          <DynamicIcon name={node.icon} size={28} />
        </div>
        {!unlocked && (
          <div
            className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-[#8A857A] bg-white border border-[#EAE6DD] shadow-sm"
          >
            <Lock size={10} />
          </div>
        )}
        {unlocked && node.xp_bonus > 0 && (
          <div
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-[#5B57F0] text-white shadow-sm"
            style={{ fontSize: 9 }}
          >
            +{node.xp_bonus}
          </div>
        )}
      </motion.div>

      {/* Label */}
      <div className="mt-2 text-center w-full px-1">
        <div
          className={`text-xs font-bold leading-tight ${unlocked ? 'text-[#232019]' : 'text-[#8A857A]'}`}
        >
          {node.name}
        </div>
        <div className="text-xs mt-0.5 text-[#8A857A]">
          Tier {node.tier}
        </div>
      </div>
    </div>
  )
}

interface TreeBranchViewProps {
  branchKey: string
  statVal: number
}

function TreeBranchView({ branchKey, statVal }: TreeBranchViewProps) {
  const branch = SKILL_TREES[branchKey]
  if (!branch) return null

  const { nodes, color } = branch
  const unlockedCount = nodes.filter((n) => isNodeUnlocked(n, statVal)).length
  const currentNodeIdx = nodes.findIndex((n) => !isNodeUnlocked(n, statVal))
  const totalHeight = nodes.length * (NODE_SIZE + NODE_GAP) - NODE_GAP / 2

  return (
    <div className="flex flex-col items-center w-full">
      {/* SVG connector lines */}
      <div className="relative flex flex-col items-center gap-0" style={{ width: NODE_SIZE + 32 }}>
        <svg
          width={4}
          height={totalHeight}
          className="absolute left-1/2 top-[40px]"
          style={{ transform: 'translateX(-2px)', zIndex: 0 }}
        >
          {nodes.slice(0, -1).map((_, i) => {
            const y1 = i * (NODE_SIZE + NODE_GAP) + NODE_SIZE / 2
            const y2 = (i + 1) * (NODE_SIZE + NODE_GAP) - NODE_SIZE / 2
            const segmentUnlocked = isNodeUnlocked(nodes[i + 1], statVal)
            return (
              <line
                key={i}
                x1="2"
                y1={y1}
                x2="2"
                y2={y2}
                strokeWidth={3}
                stroke={segmentUnlocked ? color : '#EAE6DD'}
                strokeDasharray={segmentUnlocked ? 'none' : '6,4'}
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {nodes.map((node, i) => (
          <div
            key={node.id}
            style={{ marginBottom: i < nodes.length - 1 ? NODE_GAP : 0, position: 'relative', zIndex: 1 }}
          >
            <SkillNodeCircle
              node={node}
              color={color}
              statVal={statVal}
              isCurrent={i === currentNodeIdx}
            />
          </div>
        ))}
      </div>

      {/* Progress label */}
      <div className="mt-6 text-center">
        <div className="text-sm font-bold" style={{ color }}>
          {unlockedCount} / {nodes.length} unlocked
        </div>
        {currentNodeIdx !== -1 && (
          <div className="text-xs mt-1 text-[#8A857A]">
            Next: {nodes[currentNodeIdx].req_stat} {branch.label} pts needed
          </div>
        )}
      </div>
    </div>
  )
}

export default function SkillsPage() {
  const { profile, stats, loading } = useProfile()
  const [selectedBranch, setSelectedBranch] = useState('strength')

  const branch = SKILL_TREES[selectedBranch]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBFAF7]">
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse bg-emerald-50 border border-emerald-200"
          >
            <TreePine size={28} className="text-emerald-600" />
          </div>
          <div className="text-sm font-semibold text-[#8A857A]">
            Loading Skill Tree...
          </div>
        </div>
      </div>
    )
  }

  const totalUnlocked = SKILL_TREE_ORDER.reduce((acc, key) => {
    const b = SKILL_TREES[key]
    const sv = getStatValue(stats, b.statKey)
    return acc + b.nodes.filter((n) => isNodeUnlocked(n, sv)).length
  }, 0)

  const totalNodes = SKILL_TREE_ORDER.reduce((acc, key) => acc + SKILL_TREES[key].nodes.length, 0)

  // Next unlock hint
  const nextUnlock = (() => {
    for (const key of SKILL_TREE_ORDER) {
      const b = SKILL_TREES[key]
      const sv = getStatValue(stats, b.statKey)
      const locked = b.nodes.find((n) => !isNodeUnlocked(n, sv))
      if (locked) return { branch: b, node: locked, sv }
    }
    return null
  })()

  return (
    <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]">
      <Sidebar
        userAvatar={profile?.avatar_emoji}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240 }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2.5 text-[#232019]">
              <span>Skill Tree</span>
              <TreePine size={26} className="text-emerald-600" />
            </h1>
            <p className="text-sm text-[#6E6A61]">Unlock your potential — complete quests to raise stats</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main tree view */}
            <div className="lg:col-span-2">
              {/* Tab pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {SKILL_TREE_ORDER.map((key) => {
                  const b = SKILL_TREES[key]
                  const active = selectedBranch === key
                  const IconComp = BRANCH_ICONS[key] ?? Sparkles
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedBranch(key)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
                      style={{
                        background: active ? `${b.color}15` : '#FFFFFF',
                        color: active ? b.color : '#6E6A61',
                        border: `1.5px solid ${active ? b.color : '#EAE6DD'}`,
                      }}
                    >
                      <IconComp size={16} />
                      <span>{b.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Tree card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedBranch}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl p-8 flex flex-col items-center bg-white border border-[#EAE6DD] shadow-sm"
                  style={{
                    minHeight: 600,
                  }}
                >
                  {/* Branch header */}
                  <div className="text-center mb-8">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm"
                      style={{
                        background: `${branch?.color}15`,
                        border: `1.5px solid ${branch?.color}33`,
                        color: branch?.color,
                      }}
                    >
                      {(() => {
                        const IconComp = BRANCH_ICONS[selectedBranch] ?? Sparkles
                        return <IconComp size={32} />
                      })()}
                    </div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: branch?.color }}
                    >
                      {branch?.label} Path
                    </h2>
                    <p className="text-sm mt-1 text-[#6E6A61]">
                      Current value:{' '}
                      <span className="font-bold" style={{ color: branch?.color }}>
                        {getStatValue(stats, branch?.statKey ?? '')}
                      </span>
                    </p>
                  </div>

                  {branch && (
                    <TreeBranchView
                      branchKey={selectedBranch}
                      statVal={getStatValue(stats, branch.statKey)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Overall progress */}
              <div className="rounded-2xl p-5 bg-white border border-[#EAE6DD] shadow-sm">
                <h3 className="font-bold text-xs mb-4 uppercase tracking-wider text-[#8A857A]">
                  Progress
                </h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-extrabold text-[#5B57F0]">
                    {totalUnlocked}
                  </div>
                  <div className="text-xs text-[#8A857A] mt-1">
                    of {totalNodes} nodes unlocked
                  </div>
                  <div className="mt-3 h-2 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#EAE6DD]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#5B57F0] to-[#8B5CF6]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalUnlocked / totalNodes) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* All stats */}
              <div className="rounded-2xl p-5 bg-white border border-[#EAE6DD] shadow-sm">
                <h3 className="font-bold text-xs mb-4 uppercase tracking-wider text-[#8A857A]">
                  Your Stats
                </h3>
                <div className="space-y-3">
                  {SKILL_TREE_ORDER.map((key) => {
                    const b = SKILL_TREES[key]
                    const sv = getStatValue(stats, b.statKey)
                    const unlocked = b.nodes.filter((n) => isNodeUnlocked(n, sv)).length
                    const IconComp = BRANCH_ICONS[key] ?? Sparkles
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
                          style={{ background: `${b.color}15`, color: b.color }}
                        >
                          <IconComp size={15} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-[#6E6A61]">{b.label}</span>
                            <span style={{ color: b.color }}>{sv}</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden bg-[#FAF8F5] border border-[#EAE6DD]">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: b.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(sv, 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium w-8 text-right text-[#8A857A]">
                          {unlocked}/{b.nodes.length}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Next unlock hint */}
              {nextUnlock && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 shadow-sm"
                  style={{
                    background: `${nextUnlock.branch.color}0D`,
                    border: `1px solid ${nextUnlock.branch.color}33`,
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: nextUnlock.branch.color }}>
                    <Target size={14} />
                    <span>Next Unlock</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: `${nextUnlock.branch.color}22`, color: nextUnlock.branch.color }}
                    >
                      <DynamicIcon name={nextUnlock.node.icon} size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#232019]">
                        {nextUnlock.node.name}
                      </div>
                      <div className="text-xs text-[#6E6A61]">
                        Need {nextUnlock.branch.label}{' '}
                        <span className="font-bold" style={{ color: nextUnlock.branch.color }}>
                          {nextUnlock.node.req_stat}
                        </span>{' '}
                        (you: {nextUnlock.sv})
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
