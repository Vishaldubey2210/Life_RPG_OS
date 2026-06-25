'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HPBarProps {
  hp: number
  hpMax: number
  showFloatUp?: boolean
  className?: string
}

function getHPTier(hp: number, hpMax: number) {
  const pct = hpMax > 0 ? (hp / hpMax) * 100 : 100
  if (pct > 75) return { color: '#22C55E', label: 'Full Health ❤️', flash: false }
  if (pct > 50) return { color: '#EAB308', label: 'Healthy 💛', flash: false }
  if (pct > 25) return { color: '#F97316', label: 'Taking Damage 🧡', flash: false }
  if (pct > 0)  return { color: '#EF4444', label: 'Critical! ❤️‍🩹', flash: true }
  return { color: '#6B7280', label: 'Defeated 💀', flash: false }
}

export default function HPBar({ hp, hpMax, showFloatUp = false, className }: HPBarProps) {
  const tier = getHPTier(hp, hpMax)
  const pct = hpMax > 0 ? Math.max(0, Math.min(100, (hp / hpMax) * 100)) : 100
  const [shake, setShake] = useState(false)
  const [floatTexts, setFloatTexts] = useState<{ id: number; text: string; color: string }[]>([])
  const [prevHp, setPrevHp] = useState(hp)
  let floatIdCounter = 0

  useEffect(() => {
    if (hp !== prevHp && showFloatUp) {
      const diff = hp - prevHp
      const isHeal = diff > 0
      if (!isHeal) setShake(true)

      const id = ++floatIdCounter
      setFloatTexts(prev => [...prev, {
        id,
        text: isHeal ? `+${diff} HP ❤️` : `${diff} HP`,
        color: isHeal ? '#22C55E' : '#EF4444',
      }])
      setTimeout(() => setFloatTexts(prev => prev.filter(f => f.id !== id)), 900)
      if (!isHeal) setTimeout(() => setShake(false), 400)
    }
    setPrevHp(hp)
  }, [hp])

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Float-up texts */}
      <AnimatePresence>
        {floatTexts.map(f => (
          <motion.div
            key={f.id}
            className="absolute right-0 text-xs font-bold pointer-events-none z-10"
            style={{ color: f.color, fontFamily: 'Oxanium, sans-serif', top: -20 }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -50, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {f.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: '#9B99B8' }}>❤️ HP</span>
        <span style={{ color: tier.color, fontFamily: 'Oxanium, sans-serif' }}>
          {hp}/{hpMax} — {tier.label}
        </span>
      </div>

      <div
        className={`h-2.5 rounded-full overflow-hidden ${shake ? 'hp-shake' : ''}`}
        style={{ background: '#1E1E35' }}
      >
        <motion.div
          className={`h-full rounded-full transition-colors duration-500 ${tier.flash ? 'critical-flash' : ''}`}
          style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc)` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {hp <= 0 && (
        <div
          className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center"
          style={{ fontSize: 10, color: '#5C5A7A' }}
        >
          DEFEATED
        </div>
      )}
    </div>
  )
}
