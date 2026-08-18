import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Swords, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'

interface LevelUpModalProps {
  isOpen: boolean
  newLevel: number
  onClose: () => void
}

export default function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  const fired = useRef(false)

  useEffect(() => {
    if (isOpen && !fired.current) {
      fired.current = true
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7C3AED', '#9F67FF', '#F59E0B', '#F1F0FF'],
      })
    }
    if (!isOpen) fired.current = false
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ background: 'rgba(8,8,15,0.92)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative text-center px-8 py-10 rounded-3xl"
            style={{
              background: '#13131F',
              border: '2px solid #7C3AED',
              boxShadow: '0 0 60px #7C3AED44, 0 0 120px #7C3AED22',
              maxWidth: 400,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: '#5C5A7A' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#9B99B8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5C5A7A')}
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1] }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
                boxShadow: '0 0 30px #7C3AED66',
              }}
            >
              <Zap size={40} color="#fff" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2
                className="text-3xl sm:text-4xl font-bold mb-2 level-up-animation"
                style={{ fontFamily: 'Oxanium, sans-serif', color: '#F59E0B' }}
              >
                LEVEL UP!
              </h2>
              <p className="text-base sm:text-lg mb-6" style={{ color: '#9B99B8' }}>
                You are now{' '}
                <span style={{ color: '#F1F0FF', fontFamily: 'Oxanium, sans-serif', fontWeight: 700 }}>
                  Level {newLevel}
                </span>
              </p>

              <div className="flex flex-col gap-2 mb-8 text-sm" style={{ color: '#9F67FF' }}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  +5 to all stats unlocked
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Swords size={14} style={{ color: '#F59E0B' }} />
                  New quests available
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: '#7C3AED',
                  color: '#F1F0FF',
                  fontFamily: 'Oxanium, sans-serif',
                  boxShadow: '0 0 20px #7C3AED44',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#6D28D9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#7C3AED')}
              >
                Continue Adventure <ArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
