import { useState } from 'react'
import { Bell } from 'lucide-react'

export function PushPermission() {
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)

  const requestPermission = async () => {
    try {
      setLoading(true)
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        })
      }
      setDismissed(true)
    } catch (err) {
      console.error('Push permission error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (dismissed) return null

  return (
    <div
      style={{
        background: '#13131F',
        border: '1px solid #2E2E50',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#7C3AED22',
          border: '1px solid #7C3AED44',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#9F67FF',
        }}
      >
        <Bell size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: '#F1F0FF',
            margin: 0,
          }}
        >
          Enable quest reminders?
        </p>
        <p style={{ color: '#9B99B8', fontSize: 12, margin: 0, marginTop: 2 }}>
          We&apos;ll remind you to complete your daily quests and protect your streak
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#5C5A7A',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
        <button
          onClick={requestPermission}
          disabled={loading}
          style={{
            background: '#7C3AED',
            color: 'white',
            border: 'none',
            padding: '6px 14px',
            borderRadius: 8,
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Enabling...' : 'Enable'}
        </button>
      </div>
    </div>
  )
}
