import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Trophy, Sparkles, X } from 'lucide-react'
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
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(245,158,11,0.95))',
            boxShadow: '0 4px 40px rgba(245,158,11,0.3)',
          }}
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} color="#fff" />
            </div>
            <div>
              <div
                className="font-bold text-sm sm:text-base flex items-center gap-2 text-white"
                style={{ fontFamily: 'Oxanium, sans-serif' }}
              >
                <span>PERFECT DAY! All quests complete!</span>
                <Sparkles size={16} className="text-amber-200 animate-pulse" />
              </div>
              <div className="text-xs sm:text-sm text-white/90 flex items-center gap-1.5" style={{ fontFamily: 'Oxanium, sans-serif' }}>
                <Trophy size={13} className="text-amber-200" />
                +{bonusXP} bonus XP earned
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
