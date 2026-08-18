import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { welcomeEmail } from '@/lib/emails/welcome'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    const name = profile?.display_name ?? user.email.split('@')[0] ?? 'Adventurer'

    await sendEmail({
      to: user.email,
      subject: `Welcome to Life RPG OS, ${name}! ⚔️`,
      html: welcomeEmail(name),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Welcome email error:', err)
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}
