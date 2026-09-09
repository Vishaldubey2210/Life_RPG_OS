'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthRecoveryListener() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Inspect URL hash and query params for recovery markers
    const hash = window.location.hash || ''
    const search = window.location.search || ''

    const isRecovery =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      search.includes('next=/reset-password') ||
      search.includes('next=%2Freset-password')

    if (isRecovery && pathname !== '/reset-password') {
      router.replace(`/reset-password${hash}`)
      return
    }

    // 2. Listen to Supabase Auth State Change events for PASSWORD_RECOVERY
    const { data: authListener } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (pathname !== '/reset-password') {
          router.replace('/reset-password')
        }
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [pathname, router, supabase.auth])

  return null
}
