import { headers } from 'next/headers'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowSeconds: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowSeconds: 60,
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `rate_limit:${identifier}`

  let record = rateLimitStore.get(key)

  if (!record || now >= record.resetTime) {
    // Create new rate limit window
    record = {
      count: 1,
      resetTime: now + config.windowSeconds * 1000,
    }
    rateLimitStore.set(key, record)
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: record.resetTime }
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime }
}

export async function getClientIdentifier(): Promise<string> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  return ip
}

export async function enforceRateLimit(
  identifier?: string,
  config?: RateLimitConfig
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const id = identifier || (await getClientIdentifier())
  const result = checkRateLimit(id, config)

  return {
    allowed: result.allowed,
    headers: {
      'X-RateLimit-Limit': String(config?.maxRequests || DEFAULT_CONFIG.maxRequests),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
    },
  }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now >= value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Cleanup every minute
