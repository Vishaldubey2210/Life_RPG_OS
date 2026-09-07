'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Critical Root Layout crash caught by GlobalError', error, {
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#FBFAF7',
          color: '#2B2823',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: 440,
            padding: '32px 24px',
            background: '#FFFFFF',
            border: '1px solid #EAE6DD',
            borderRadius: 16,
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', color: '#2B2823' }}>
            System Interruption
          </h2>
          <p style={{ fontSize: 14, color: '#6E6A61', lineHeight: 1.5, margin: '0 0 20px 0' }}>
            A temporary system error occurred. Please refresh or retry.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 24px',
              borderRadius: 999,
              background: '#5B57F0',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Reload Realm
          </button>
        </div>
      </body>
    </html>
  )
}
