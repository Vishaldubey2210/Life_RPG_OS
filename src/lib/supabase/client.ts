import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a stub during build-time / SSR prerender when env vars aren't set
    return null as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}
