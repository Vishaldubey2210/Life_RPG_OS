'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/providers/QueryProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { FeedbackButton } from '@/components/feedback/FeedbackButton'
import { logError } from '@/lib/errorLogger'

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (
      message: Event | string,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error,
    ) => {
      if (error) {
        logError(error, {
          errorType: 'uncaught',
          pageUrl: source || window.location.href,
          metadata: { line: lineno, column: colno },
        })
      }
    }

    window.onerror = handleError
    window.onunhandledrejection = (event) => {
      const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      logError(reason, { errorType: 'unhandled_promise' })
    }

    return () => {
      window.onerror = null
      window.onunhandledrejection = null
    }
  }, [])

  return (
    <>
      <QueryProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
        <FeedbackButton />
      </QueryProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#13131F',
            border: '1px solid #2E2E50',
            color: '#F1F0FF',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </>
  )
}
