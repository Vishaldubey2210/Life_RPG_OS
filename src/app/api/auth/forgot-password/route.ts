import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { resetPasswordEmail } from '@/lib/emails/resetPassword'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    const { origin } = new URL(request.url)
    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/$/, '')
    const redirectTo = `${appOrigin}/reset-password`

    const adminClient = createAdminClient()

    // 1. Try sending directly through Custom Gmail SMTP via Supabase Admin generateLink
    if (adminClient) {
      const { data, error: linkErr } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: trimmedEmail,
        options: {
          redirectTo,
        },
      })

      if (!linkErr && data?.properties?.action_link) {
        const actionLink = data.properties.action_link

        const emailResult = await sendEmail({
          to: trimmedEmail,
          subject: 'Reset your adventurer passcode — Life RPG OS',
          html: resetPasswordEmail({
            resetUrl: actionLink,
            expiryMinutes: 60,
          }),
        })

        if (emailResult?.success) {
          logger.info('Password reset email sent directly via Gmail SMTP', { to: trimmedEmail })
          return NextResponse.json({
            success: true,
            method: 'direct_smtp',
            message: `Password reset scroll sent to ${trimmedEmail}! Check your Inbox & Spam folder.`,
          })
        }
      } else if (linkErr) {
        logger.warn('Admin generateLink recovery error, falling back to standard reset', { error: linkErr.message })
      }
    }

    // 2. Fallback: Standard Supabase Auth Reset
    const supabase = await createClient()
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${appOrigin}/auth/callback?type=recovery&next=/reset-password`,
    })

    if (resetErr) {
      logger.error('Standard resetPasswordForEmail failed', resetErr)
      return NextResponse.json({ error: resetErr.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      method: 'supabase_auth',
      message: `Password reset scroll sent to ${trimmedEmail}! Check your Inbox & Spam folder.`,
    })
  } catch (err: unknown) {
    logger.error('Unexpected error in forgot-password API', err)
    return NextResponse.json({ error: 'Failed to dispatch reset email. Please try again.' }, { status: 500 })
  }
}
