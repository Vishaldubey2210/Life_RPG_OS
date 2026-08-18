import { createClient } from '@/lib/supabase/client'

export async function logError(
  error: Error,
  context: {
    userId?: string
    pageUrl?: string
    errorType?: string
    metadata?: Record<string, unknown>
  } = {},
) {
  try {
    const supabase = createClient()
    if (!supabase) return

    const payload = {
      user_id: context.userId,
      error_type: context.errorType || error.name,
      error_message: error.message,
      stack_trace: error.stack || null,
      url: context.pageUrl || (typeof window !== 'undefined' ? window.location.href : null),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      severity: context.errorType === 'uncaught' ? 'critical' : 'error',
    }

    await supabase.from('error_logs').insert(payload)
  } catch {
    console.error('Failed to log error:', error)
  }
}
