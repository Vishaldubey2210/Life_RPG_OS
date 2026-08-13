import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await request.json()

  // Store subscription in user profile
  await supabase
    .from('profiles')
    .update({ push_subscription: subscription })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
