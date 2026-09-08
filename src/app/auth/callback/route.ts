import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/emails/welcome'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next')

  if (!code) {
    logger.warn('Auth callback invoked without code parameter')
    return NextResponse.redirect(`${origin}/login?error=missing_auth_code`)
  }

  const supabase = await createClient()
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError) {
    logger.error('Auth code exchange error in callback', sessionError)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  // 1. Password Recovery Flow: redirect directly to reset-password page
  if (type === 'recovery' || next === '/reset-password' || next?.includes('reset-password')) {
    logger.info('Auth recovery flow authenticated, routing to /reset-password')
    return NextResponse.redirect(`${origin}/reset-password`)
  }

  // 2. Fetch authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    logger.error('Failed to get user details after auth callback', userError)
    return NextResponse.redirect(`${origin}/login`)
  }

  // 3. Check if player profile already exists
  const { data: existingProfile, error: profileFetchErr } = await supabase
    .from('profiles')
    .select('id, onboarding_completed, display_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileFetchErr) {
    logger.error('Error querying profile in callback', profileFetchErr)
  }

  // 4. If new user (e.g. 1-Click Google Sign Up), automatically create profile and starting stats
  if (!existingProfile) {
    const rawName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email?.split('@')[0] ||
      'Adventurer'

    const avatarUrl =
      (user.user_metadata?.avatar_url as string) ||
      (user.user_metadata?.picture as string) ||
      null

    logger.info('Creating new player profile via 1-Click OAuth', {
      userId: user.id,
      email: user.email,
      displayName: rawName,
    })

    const { error: profileInsertErr } = await supabase.from('profiles').insert({
      id: user.id,
      display_name: rawName,
      avatar_emoji: '⚔️',
      level: 1,
      xp: 0,
      xp_to_next: 100,
      hp: 100,
      hp_max: 100,
      streak: 0,
      onboarding_completed: false,
    })

    if (profileInsertErr) {
      logger.error('Failed to auto-create profile for OAuth user', profileInsertErr)
    }

    // Insert initial base RPG stats
    const { error: statsInsertErr } = await supabase.from('stats').insert({
      user_id: user.id,
      str: 10,
      int: 10,
      wis: 10,
      vit: 10,
      gold: 0,
      cha: 10,
    })

    if (statsInsertErr) {
      logger.error('Failed to insert initial stats for OAuth user', statsInsertErr)
    }

    // Send Welcome Email in background via Gmail SMTP
    if (user.email) {
      sendEmail({
        to: user.email,
        subject: `Welcome to Life RPG OS, ${rawName}! ⚔️`,
        html: welcomeEmail(rawName),
      }).catch((err) => logger.error('Async welcome email failure in callback', err))
    }

    return NextResponse.redirect(`${origin}/onboarding`)
  }

  // 5. Existing user: Route based on onboarding status
  const targetPath = existingProfile.onboarding_completed ? '/dashboard' : '/onboarding'
  return NextResponse.redirect(`${origin}${targetPath}`)
}
