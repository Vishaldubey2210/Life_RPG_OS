'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logger } from '@/lib/logger'
import { logError } from '@/lib/errorLogger'

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log complete developer diagnostic details to structured logs & database
    logger.error('Unhandled UI render error caught by root boundary', error, {
      digest: error.digest,
    })
    logError(error, { errorType: 'RootErrorBoundary' })
  }, [error])

  // User-facing error digest / reference ID (no code traces shown)
  const errorRef = error.digest ? `ERR-${error.digest.slice(0, 8)}` : `ERR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FBFAF7',
        color: '#2B2823',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid #EAE6DD',
          borderRadius: 20,
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(43, 40, 35, 0.05)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#FEECEB',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#2B2823',
            margin: '0 0 10px 0',
            letterSpacing: '-0.02em',
          }}
        >
          A Glitch in the Realm
        </h2>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: '#6E6A61',
            margin: '0 0 20px 0',
          }}
        >
          An unexpected interruption occurred on this path. Your character stats, habits, and quest progress are secure.
        </p>

        {/* Safe Reference ID for Support */}
        <div
          style={{
            display: 'inline-block',
            padding: '6px 12px',
            background: '#FAF8F5',
            border: '1px solid #EAE6DD',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#8A857A',
            marginBottom: 24,
          }}
        >
          Ref: {errorRef}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 20px',
              background: '#5B57F0',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#4A46E0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#5B57F0')}
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 20px',
              background: '#FAF8F5',
              color: '#2B2823',
              border: '1px solid #EAE6DD',
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            <Home size={15} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
