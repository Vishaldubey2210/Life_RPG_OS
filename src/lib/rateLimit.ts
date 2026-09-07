/**
 * In-Memory Sliding Window Rate Limiter
 * Protects public API endpoints from spam and automated brute-force attacks.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const tracker = new Map<string, RateLimitRecord>()

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of tracker.entries()) {
      if (now > value.resetTime) {
        tracker.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Checks if an identifier (IP address, user ID, or token) has exceeded limit.
 * @param identifier Unique string identifier (e.g. client IP)
 * @param limit Maximum allowed requests within windowMs
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 minute)
 */
export function rateLimit(
  identifier: string,
  limit = 30,
  windowMs = 60 * 1000
): RateLimitResult {
  const now = Date.now()
  const record = tracker.get(identifier)

  if (!record || now > record.resetTime) {
    tracker.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    }
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetTime,
    }
  }

  record.count += 1
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetTime,
  }
}
