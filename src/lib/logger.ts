import { NextResponse } from 'next/server'

/**
 * Production-Grade Structured Logger & Error Sanitizer
 * - Logs detailed structured diagnostics for developers & server logs.
 * - Scrubs sensitive tokens, credentials, and cookies.
 * - Prevents raw internal developer errors/traces from leaking to end users.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'apikey',
  'api_key',
  'service_role',
  'private_key',
  'cookie',
  'bearer',
]

function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data

  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))
    if (isSensitive && typeof value === 'string') {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

class Logger {
  private isProd = process.env.NODE_ENV === 'production'

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const sanitizedContext = context ? sanitizeData(context) : undefined

    if (this.isProd) {
      const payload = {
        timestamp,
        level,
        message,
        ...(sanitizedContext ? { context: sanitizedContext } : {}),
      }
      if (level === 'error') {
        console.error(JSON.stringify(payload))
      } else if (level === 'warn') {
        console.warn(JSON.stringify(payload))
      } else {
        console.log(JSON.stringify(payload))
      }
    } else {
      const color =
        level === 'error'
          ? '\x1b[31m'
          : level === 'warn'
          ? '\x1b[33m'
          : level === 'info'
          ? '\x1b[36m'
          : '\x1b[90m'
      const reset = '\x1b[0m'
      console.log(
        `${color}[${level.toUpperCase()}]${reset} ${message}`,
        sanitizedContext ? sanitizedContext : ''
      )
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (!this.isProd) this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  error(message: string, errorOrContext?: unknown, additionalContext?: Record<string, unknown>) {
    let context: Record<string, unknown> = {}

    if (errorOrContext instanceof Error) {
      context = {
        errorName: errorOrContext.name,
        errorMessage: errorOrContext.message,
        stack: errorOrContext.stack,
        ...additionalContext,
      }
    } else if (errorOrContext && typeof errorOrContext === 'object') {
      context = {
        ...errorOrContext,
        ...additionalContext,
      }
    } else if (errorOrContext) {
      context = {
        rawError: String(errorOrContext),
        ...additionalContext,
      }
    }

    this.log('error', message, context)
  }
}

export const logger = new Logger()

/**
 * Transforms any technical error into a user-safe, friendly error message.
 * Internal database details, stack traces, and code lines are hidden from the user.
 */
export function formatSafeUserError(
  error: unknown,
  fallback = 'An unexpected error occurred. Please try again.'
): string {
  if (!error) return fallback

  const rawMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  const lower = rawMessage.toLowerCase()

  // Whitelist safe business logic messages
  if (lower.includes('rate limit')) return 'Too many requests. Please slow down and try again shortly.'
  if (lower.includes('unauthorized') || lower.includes('unauthenticated') || lower.includes('jwt'))
    return 'Your session has expired. Please sign in again.'
  if (lower.includes('invalid credentials')) return 'Email or password is incorrect.'
  if (lower.includes('not found')) return 'The requested resource could not be found.'
  if (lower.includes('permission') || lower.includes('forbidden'))
    return 'You do not have permission to perform this action.'

  // Hide internal database errors, sql syntax, missing env keys, network socket crashes
  return fallback
}

/**
 * Standardized API error response handler:
 * - Logs complete developer error & stack trace on server
 * - Returns clean, sanitized message to the client
 */
export function safeErrorResponse(
  error: unknown,
  options: {
    context?: string
    fallbackMessage?: string
    status?: number
  } = {}
) {
  const { context = 'API Error', fallbackMessage, status = 500 } = options
  const traceId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`

  // Log complete diagnostic error for developers
  logger.error(`[${context}] TraceID: ${traceId}`, error, { traceId })

  // Return clean, safe payload to user/frontend
  const userMessage = formatSafeUserError(error, fallbackMessage)

  return NextResponse.json(
    {
      success: false,
      error: userMessage,
      traceId,
    },
    { status }
  )
}
