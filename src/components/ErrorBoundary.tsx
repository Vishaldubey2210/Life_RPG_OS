'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
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
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">Something broke in your adventure</h2>
            <p className="text-sm text-slate-400">{this.state.error?.message}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-semibold text-white flex items-center gap-2"
            >
              <RotateCcw size={15} />
              <span>Try Again</span>
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
