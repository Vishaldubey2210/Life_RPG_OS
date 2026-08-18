import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Download, X } from 'lucide-react'

export function InstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show after 10 seconds on app view
      setTimeout(() => setShowPrompt(true), 10000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: 80,
            left: 16,
            right: 16,
            zIndex: 999,
          }}
          className="md:left-auto md:right-4 md:w-80"
        >
          <div
            style={{
              background: '#1A1A2E',
              border: '1px solid #7C3AED',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 20px 40px rgba(124,58,237,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Swords size={18} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 600, color: '#F1F0FF', margin: 0 }}>
                  Add to Home Screen
                </p>
                <p style={{ color: '#9B99B8', fontSize: 13, marginTop: 4, margin: 0 }}>
                  Install Life RPG OS for the best experience
                </p>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                style={{ background: 'none', border: 'none', color: '#5C5A7A', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowPrompt(false)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: '1px solid #2E2E50',
                  background: 'transparent',
                  color: '#9B99B8',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: '#7C3AED',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Download size={14} />
                <span>Install App</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
