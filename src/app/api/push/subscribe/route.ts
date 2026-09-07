import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeErrorResponse } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await request.json()

    // Store subscription in user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ push_subscription: subscription })
      .eq('id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return safeErrorResponse(error, {
      context: 'Push Subscribe API',
      fallbackMessage: 'Unable to save push subscription.',
    })
  }
}
