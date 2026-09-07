/**
 * Production-Grade Structured Logger
 * Sanitizes sensitive credentials and formats logs as structured JSON in production.
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

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context)
  }
}

export const logger = new Logger()
