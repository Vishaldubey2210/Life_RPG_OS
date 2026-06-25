'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface PerfectDayBannerProps {
  show: boolean
  bonusXP?: number
  onDismiss: () => void
}

export default function PerfectDayBanner({ show, bonusXP = 100, onDismiss }: PerfectDayBannerProps) {
  useEffect(() => {
    if (!show) return

    confetti({
      particleCount: 80,
      spread: 120,
      origin: { y: 0.1 },
      colors: ['#F59E0B', '#7C3AED', '#22C55E'],
    })

    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [show, onDismiss])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
            boxShadow: '0 4px 40px #F59E0B44',
          }}
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <div
                className="font-bold text-base"
                style={{ fontFamily: 'Oxanium, sans-serif', color: '#fff' }}
              >
                PERFECT DAY! All quests complete!
              </div>
              <div className="text-sm" style={{ color: '#fff9', fontFamily: 'Oxanium, sans-serif' }}>
                +{bonusXP} bonus XP earned 🏆
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/70 hover:text-white transition-colors text-xl px-2"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
