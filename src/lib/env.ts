/**
 * Production Environment Variables Validator & Schema
 * Ensures all required environment variables are present and correctly typed.
 */

export interface AppEnv {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  NEXT_PUBLIC_APP_URL: string
  GROQ_API_KEY?: string
  RESEND_API_KEY?: string
  NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string
  VAPID_PRIVATE_KEY?: string
  CRON_SECRET?: string
  NODE_ENV: 'development' | 'production' | 'test'
}

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const requiredClientVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  for (const varName of requiredClientVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required client environment variable: ${varName}`)
    }
  }

  // If Supabase URL is present, ensure it's a valid URL
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const env: AppEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  NODE_ENV: (process.env.NODE_ENV as AppEnv['NODE_ENV']) || 'development',
}
