import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_auth_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).maybeSingle()
    : { data: null }

  return NextResponse.redirect(`${origin}${profile?.onboarding_completed ? '/dashboard' : '/onboarding'}`)
}
