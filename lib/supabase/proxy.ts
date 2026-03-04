import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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
  const { data: { user } } = await supabase.auth.getUser()
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname

  // 1. Define Public Routes
  const publicRoutes = ['/', '/login', '/forgot-password', '/auth', '/update-password']
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith('/auth'))

  // 2. GUARD: Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. GUARD: Restrict access to password update page to recovery sessions only
  if (pathname.startsWith('/update-password')) {
    const isRecovery = (session as any)?.recovery;
    if (!isRecovery) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // 4. GUARD: Onboarding Page
  if (pathname.startsWith('/onboarding')) {
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('id', user.id)
      .single()
    const isRecovery = (session as any)?.recovery;
    if (profile?.has_completed_onboarding || isRecovery) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard-redirect'
      return NextResponse.redirect(url)
    }
  }

  // 5. GUARD: Prevent logged-in users from seeing the login page
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard-redirect'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Return the synchronized response object to maintain session
  return supabaseResponse
}