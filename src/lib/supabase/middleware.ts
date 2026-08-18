import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const isMaintenanceOn = (value: unknown) => value === true || value === 'true'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (
    !user &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/auth') &&
    pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  try {
    const { data: maintenance } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    if (
      isMaintenanceOn(maintenance?.value) &&
      !pathname.startsWith('/maintenance') &&
      !pathname.startsWith('/admin')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/maintenance'
      return NextResponse.redirect(url)
    }
  } catch {
    // Ignore config lookup failures and keep app available.
  }

  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_suspended, is_admin')
        .eq('id', user.id)
        .single()

      if (profile?.is_suspended && !pathname.startsWith('/suspended')) {
        const url = request.nextUrl.clone()
        url.pathname = '/suspended'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/admin') && !profile?.is_admin) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch {
      // Ignore profile lookup issues and continue; the app will handle auth flow separately.
    }
  }

  return supabaseResponse
}
