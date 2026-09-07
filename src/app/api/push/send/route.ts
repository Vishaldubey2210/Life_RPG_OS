import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeErrorResponse } from '@/lib/logger'

if (
  process.env.VAPID_EMAIL &&
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY
) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function POST(request: Request) {
  try {
    const { userId, title, body, url } = await request.json()

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_subscription')
      .eq('id', userId)
      .single()

    if (!profile?.push_subscription) {
      return NextResponse.json({ error: 'No push subscription found' }, { status: 404 })
    }

    await webpush.sendNotification(
      profile.push_subscription,
      JSON.stringify({ title, body, url: url || '/dashboard' })
    )
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, {
      context: 'Push Notification Send API',
      fallbackMessage: 'Unable to deliver push notification.',
    })
  }
}
