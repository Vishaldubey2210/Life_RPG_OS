import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  const envValidation = validateEnv()

  // Verify database connectivity if configured
  let dbStatus = 'unconfigured'
  let dbLatency = 0

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const dbStart = Date.now()
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
      dbLatency = Date.now() - dbStart
      dbStatus = error ? `degraded: ${error.message}` : 'healthy'
    } catch (err: unknown) {
      dbStatus = `unreachable: ${err instanceof Error ? err.message : 'unknown'}`
    }
  }

  const memoryUsage = process.memoryUsage ? process.memoryUsage() : null
  const uptime = process.uptime ? process.uptime() : 0

  const healthData = {
    status: dbStatus.startsWith('healthy') || dbStatus === 'unconfigured' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(uptime),
    responseTimeMs: Date.now() - startTime,
    environment: process.env.NODE_ENV || 'development',
    version: '2.4.0',
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
      },
      environmentConfig: {
        status: envValidation.valid ? 'valid' : 'invalid',
        issues: envValidation.errors,
      },
    },
    system: {
      nodeVersion: process.version,
      memory: memoryUsage
        ? {
            heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
          }
        : undefined,
    },
  }

  return NextResponse.json(healthData, {
    status: healthData.status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
