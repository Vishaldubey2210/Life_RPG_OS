'use client'

import { Component, type ReactNode } from 'react'
import { logError } from '@/lib/errorLogger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    logError(error, { errorType: 'react_boundary' })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-5xl">⚠️</p>
            <h2 className="text-xl font-bold text-white">Something broke in your adventure</h2>
            <p className="text-sm text-slate-400">{this.state.error?.message}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again ⚔️
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
