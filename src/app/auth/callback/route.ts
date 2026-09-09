import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/emails/welcome'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  const isRecoveryFlow =
    type === 'recovery' || next === '/reset-password' || next?.includes('reset-password')

  // 1. Handle error parameters passed by Supabase (e.g. otp_expired)
  if (error || errorCode) {
    logger.warn('Auth callback received error parameters', { error, errorCode, errorDescription })
    if (isRecoveryFlow) {
      const desc = encodeURIComponent(errorDescription || 'Email link is invalid or has expired.')
      return NextResponse.redirect(`${origin}/reset-password?error=${errorCode || error}&error_description=${desc}`)
    }
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error || 'auth_failed')}`)
  }

  const supabase = await createClient()

  // 2. Handle token_hash verification if present
  if (tokenHash && type) {
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    })

    if (!verifyErr) {
      if (isRecoveryFlow) {
        logger.info('OTP token hash verified for password recovery')
        return NextResponse.redirect(`${origin}/reset-password`)
      }
    } else {
      logger.error('Token hash OTP verification failed', verifyErr)
      if (isRecoveryFlow) {
        return NextResponse.redirect(`${origin}/reset-password?error=otp_expired&error_description=Email+link+is+invalid+or+has+expired`)
      }
    }
  }

  // 3. Handle PKCE Code exchange
  if (code) {
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      logger.warn('Auth code exchange error on server (likely client-side PKCE)', {
        message: sessionError.message,
        isRecoveryFlow,
      })

      // If recovery flow, delegate code to client reset-password page rather than bouncing to login
      if (isRecoveryFlow) {
        return NextResponse.redirect(`${origin}/reset-password?code=${code}&type=recovery`)
      }

      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }

    // If recovery flow succeeded on server
    if (isRecoveryFlow) {
      logger.info('Auth recovery flow authenticated successfully, routing to /reset-password')
      return NextResponse.redirect(`${origin}/reset-password`)
    }
  } else if (!tokenHash) {
    logger.warn('Auth callback invoked without code or token_hash parameter')
    if (isRecoveryFlow) {
      return NextResponse.redirect(`${origin}/reset-password?error=missing_auth_code`)
    }
    return NextResponse.redirect(`${origin}/login?error=missing_auth_code`)
  }

  // 4. Fetch authenticated user details
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    logger.error('Failed to get user details after auth callback', userError)
    return NextResponse.redirect(`${origin}/login`)
  }

  // 5. Check if player profile already exists
  const { data: existingProfile, error: profileFetchErr } = await supabase
    .from('profiles')
    .select('id, onboarding_completed, display_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileFetchErr) {
    logger.error('Error querying profile in callback', profileFetchErr)
  }

  // 6. If new user (e.g. 1-Click Google Sign Up), automatically create profile and starting stats
  if (!existingProfile) {
    const rawName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email?.split('@')[0] ||
      'Adventurer'

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

  // 7. Existing user: Route based on onboarding status
  const targetPath = existingProfile.onboarding_completed ? '/dashboard' : '/onboarding'
  return NextResponse.redirect(`${origin}${targetPath}`)
}
