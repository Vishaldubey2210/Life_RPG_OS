'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { SKILL_TREES, SKILL_TREE_ORDER, SkillNode } from '@/lib/skillTree'
import { Stats } from '@/hooks/useProfile'

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
      className="absolute left-1/2 bottom-full mb-3 z-20 w-56 rounded-xl p-3 pointer-events-none"
      style={{
        background: '#1A1A2E',
        border: `1px solid ${color}44`,
        transform: 'translateX(-50%)',
        boxShadow: `0 0 20px ${color}22`,
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg">{node.icon}</span>
        <span
          className="font-bold text-sm"
          style={{ fontFamily: 'Oxanium, sans-serif', color: unlocked ? color : '#9B99B8' }}
        >
          {node.name}
        </span>
      </div>
      <p className="text-xs mb-2" style={{ color: '#9B99B8' }}>
        {node.desc}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: '#5C5A7A' }}>Unlocks at</span>
        <span style={{ color: unlocked ? color : '#EF4444', fontFamily: 'Oxanium, sans-serif' }}>
          {node.req_stat === 0 ? 'Always' : `${node.req_stat} stat pts`}
        </span>
      </div>
      {node.xp_bonus > 0 && (
        <div className="flex items-center justify-between text-xs mt-1">
          <span style={{ color: '#5C5A7A' }}>XP Bonus</span>
          <span style={{ color: '#7C3AED', fontFamily: 'Oxanium, sans-serif' }}>
            +{node.xp_bonus} XP
          </span>
        </div>
      )}
      {/* tooltip arrow */}
      <div
        className="absolute left-1/2 bottom-[-5px] w-2.5 h-2.5 rotate-45"
        style={{ background: '#1A1A2E', border: `0 0 1px 1px ${color}44`, transform: 'translateX(-50%) rotate(45deg)' }}
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
        className="relative flex items-center justify-center rounded-full cursor-pointer select-none"
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          background: unlocked ? `${color}20` : '#0F0F1A',
          border: `2px solid ${unlocked ? color : '#2E2E50'}`,
          boxShadow: unlocked ? `0 0 20px ${color}44, inset 0 0 10px ${color}11` : 'none',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={
          isCurrent
            ? { boxShadow: [`0 0 0 0 ${color}88`, `0 0 0 12px ${color}00`] }
            : {}
        }
        transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
      >
        <span className="text-3xl" style={{ filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)' }}>
          {node.icon}
        </span>
        {!unlocked && (
          <div
            className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
            style={{ background: '#13131F', border: '1px solid #2E2E50' }}
          >
            🔒
          </div>
        )}
        {unlocked && node.xp_bonus > 0 && (
          <div
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: '#7C3AED', color: '#F1F0FF', fontFamily: 'Oxanium, sans-serif', fontSize: 9 }}
          >
            +{node.xp_bonus}
          </div>
        )}
      </motion.div>

      {/* Label */}
      <div className="mt-2 text-center w-full px-1">
        <div
          className="text-xs font-semibold leading-tight"
          style={{
            fontFamily: 'Oxanium, sans-serif',
            color: unlocked ? '#F1F0FF' : '#5C5A7A',
          }}
        >
          {node.name}
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#5C5A7A' }}>
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
  // Find the "current" node — the first locked node after the last unlocked one
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
                stroke={segmentUnlocked ? color : '#2E2E50'}
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
        <div className="text-sm font-bold" style={{ fontFamily: 'Oxanium, sans-serif', color }}>
          {unlockedCount} / {nodes.length} unlocked
        </div>
        {currentNodeIdx !== -1 && (
          <div className="text-xs mt-1" style={{ color: '#5C5A7A' }}>
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
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🌳</div>
          <div
            className="text-sm"
            style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}
          >
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
    <div className="flex min-h-screen" style={{ background: '#08080F' }}>
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? '⚔️'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto p-6 xl:p-8" style={{ marginLeft: 240 }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
            >
              Skill Tree 🌳
            </h1>
            <p style={{ color: '#9B99B8' }}>Unlock your potential — complete quests to raise stats</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main tree view */}
            <div className="lg:col-span-2">
              {/* Tab pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {SKILL_TREE_ORDER.map((key) => {
                  const b = SKILL_TREES[key]
                  const active = selectedBranch === key
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedBranch(key)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                      style={{
                        background: active ? `${b.color}22` : '#13131F',
                        color: active ? b.color : '#9B99B8',
                        border: `1px solid ${active ? b.color : '#1E1E35'}`,
                        boxShadow: active ? `0 0 12px ${b.color}33` : 'none',
                      }}
                    >
                      <span>{b.icon}</span>
                      {b.label}
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
                  className="rounded-2xl p-8 flex flex-col items-center"
                  style={{
                    background: '#13131F',
                    border: `1px solid ${branch?.color ?? '#1E1E35'}22`,
                    minHeight: 600,
                  }}
                >
                  {/* Branch header */}
                  <div className="text-center mb-8">
                    <div className="text-5xl mb-2">{branch?.icon}</div>
                    <h2
                      className="text-2xl font-bold"
                      style={{ fontFamily: 'Oxanium, sans-serif', color: branch?.color }}
                    >
                      {branch?.label} Path
                    </h2>
                    <p className="text-sm mt-1" style={{ color: '#5C5A7A' }}>
                      Current value:{' '}
                      <span style={{ color: branch?.color, fontFamily: 'Oxanium, sans-serif' }}>
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
              <div
                className="rounded-2xl p-5"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                <h3
                  className="font-bold text-sm mb-4 uppercase tracking-wider"
                  style={{ fontFamily: 'Oxanium, sans-serif', color: '#9B99B8' }}
                >
                  Progress
                </h3>
                <div className="text-center mb-4">
                  <div
                    className="text-4xl font-bold"
                    style={{ fontFamily: 'Oxanium, sans-serif', color: '#7C3AED' }}
                  >
                    {totalUnlocked}
                  </div>
                  <div className="text-xs" style={{ color: '#5C5A7A' }}>
                    of {totalNodes} nodes unlocked
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalUnlocked / totalNodes) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* All stats */}
              <div
                className="rounded-2xl p-5"
                style={{ background: '#13131F', border: '1px solid #1E1E35' }}
              >
                <h3
                  className="font-bold text-sm mb-4 uppercase tracking-wider"
                  style={{ fontFamily: 'Oxanium, sans-serif', color: '#9B99B8' }}
                >
                  Your Stats
                </h3>
                <div className="space-y-3">
                  {SKILL_TREE_ORDER.map((key) => {
                    const b = SKILL_TREES[key]
                    const sv = getStatValue(stats, b.statKey)
                    const unlocked = b.nodes.filter((n) => isNodeUnlocked(n, sv)).length
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-lg w-7 text-center">{b.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: '#9B99B8' }}>{b.label}</span>
                            <span style={{ color: b.color, fontFamily: 'Oxanium, sans-serif' }}>{sv}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E35' }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: b.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(sv, 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                        <span className="text-xs w-8 text-right" style={{ color: '#5C5A7A' }}>
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
                  className="rounded-2xl p-5"
                  style={{
                    background: `${nextUnlock.branch.color}11`,
                    border: `1px solid ${nextUnlock.branch.color}33`,
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: nextUnlock.branch.color }}>
                    🎯 Next Unlock
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{nextUnlock.node.icon}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}>
                        {nextUnlock.node.name}
                      </div>
                      <div className="text-xs" style={{ color: '#9B99B8' }}>
                        Need {nextUnlock.branch.label}{' '}
                        <span style={{ color: nextUnlock.branch.color, fontFamily: 'Oxanium, sans-serif' }}>
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
