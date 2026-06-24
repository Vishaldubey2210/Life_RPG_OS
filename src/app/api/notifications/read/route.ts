import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { notification_ids } = body as { notification_ids?: string[] }

    if (notification_ids && notification_ids.length > 0) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notification_ids)
        .eq('user_id', user.id)

      if (error) throw error
    } else {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to mark notifications read' },
      { status: 500 }
    )
  }
}
