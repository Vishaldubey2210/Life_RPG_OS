'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface LevelUpScreenProps {
  isOpen: boolean
  newLevel: number
  onClose: () => void
  statGains?: { stat: string; icon: string; amount: number }[]
}

const PHASES = ['flash', 'title', 'card', 'done'] as const

export default function LevelUpScreen({ isOpen, newLevel, onClose, statGains }: LevelUpScreenProps) {
  const [phase, setPhase] = useState<typeof PHASES[number]>('flash')

  useEffect(() => {
    if (!isOpen) { setPhase('flash'); return }

    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setPhase('title'), 500))
    timers.push(setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#7C3AED', '#F59E0B', '#22C55E', '#EC4899'],
      })
    }, 600))
    timers.push(setTimeout(() => setPhase('card'), 1500))
    timers.push(setTimeout(() => setPhase('done'), 3000))
    timers.push(setTimeout(onClose, 5500))

    return () => timers.forEach(clearTimeout)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'rgba(8,8,15,0.97)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Lightning bolt - phase 1 */}
          <AnimatePresence>
            {phase === 'flash' && (
              <motion.div
                className="text-8xl"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1.2, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              >
                ⚡
              </motion.div>
            )}
          </AnimatePresence>

          {/* LEVEL UP title — phase 2+ */}
          <AnimatePresence>
            {(phase === 'title' || phase === 'card' || phase === 'done') && (
              <motion.div
                className="text-center"
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, #7C3AED44 0%, transparent 70%)',
                  }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div
                  className="text-5xl md:text-7xl font-bold mb-2"
                  style={{
                    fontFamily: 'Oxanium, sans-serif',
                    background: 'linear-gradient(135deg, #F59E0B, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                  }}
                >
                  LEVEL UP!
                </div>
                <div className="text-6xl mb-4">⚡</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card — phase 3+ */}
          <AnimatePresence>
            {(phase === 'card' || phase === 'done') && (
              <motion.div
                className="mt-4 p-8 rounded-3xl border text-center max-w-sm mx-4"
                style={{
                  background: '#13131F',
                  borderColor: '#F59E0B44',
                  boxShadow: '0 0 60px #F59E0B22, 0 0 120px #7C3AED22',
                }}
                initial={{ y: 80, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  className="text-6xl font-bold mb-2"
                  style={{ fontFamily: 'Oxanium, sans-serif', color: '#F59E0B' }}
                >
                  {newLevel}
                </div>
                <div className="text-lg font-semibold mb-1" style={{ color: '#F1F0FF' }}>
                  You are now Level {newLevel}
                </div>
                <div className="text-sm mb-6" style={{ color: '#9B99B8' }}>
                  {newLevel * 100} XP to Level {newLevel + 1}
                </div>

                {/* Stat gains */}
                {statGains && statGains.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {statGains.map((s, i) => (
                      <motion.div
                        key={s.stat}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                        style={{
                          background: '#7C3AED22',
                          color: '#9F67FF',
                          fontFamily: 'Oxanium, sans-serif',
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, type: 'spring' }}
                      >
                        {s.icon} +{s.amount} {s.stat}
                      </motion.div>
                    ))}
                  </div>
                )}

                <motion.button
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
                    color: '#fff',
                    fontFamily: 'Oxanium, sans-serif',
                  }}
                  onClick={onClose}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Continue Adventure ⚔️
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
