'use client'

import { useState } from 'react'

export function ShareButton({ username }: { username: string }) {
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    try {
      setLoading(true)
      const shareUrl = `${window.location.origin}/share/card?username=${username}`
      const response = await fetch(shareUrl)
      const blob = await response.blob()
      const file = new File([blob], 'life-rpg-progress.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Life RPG OS Progress',
          text: "I'm leveling up my life on Life RPG OS! Join me ⚔️",
          files: [file],
          url: window.location.origin,
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'life-rpg-progress.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      style={{
        background: 'transparent',
        border: '1px solid #7C3AED',
        color: '#9F67FF',
        padding: '8px 16px',
        borderRadius: 10,
        fontFamily: "'Oxanium', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      📤 {loading ? 'Preparing Card...' : 'Share Progress'}
    </button>
  )
}
