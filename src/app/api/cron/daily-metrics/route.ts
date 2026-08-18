import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { error } = await supabase.rpc('generate_daily_metrics')
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Daily metrics cron failed:', error)
    return NextResponse.json({ error: 'Daily metrics failed' }, { status: 500 })
  }
}
