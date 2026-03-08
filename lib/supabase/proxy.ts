import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => 
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const pathname = request.nextUrl.pathname

  // 1. Define Public Routes
  const publicRoutes = ['/', '/login', '/forgot-password', '/auth']
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith('/auth'))

  // 2. Fetch profile data if user exists
  let userRole = 'viewer';
  let hasCompletedOnboarding = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, has_completed_onboarding')
      .eq('id', user.id)
      .single()
    
    userRole = String(profile?.role);
    hasCompletedOnboarding = profile?.has_completed_onboarding || false;
  }

  // 3. GUARD: Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. GUARD: Password Update
  if (pathname.startsWith('/update-password')) {
    const isRecovery = (session as any)?.recovery;
    if (!isRecovery) return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. GUARD: Onboarding Page
  if (pathname.startsWith('/onboarding')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    const isRecovery = (session as any)?.recovery;
    if (hasCompletedOnboarding || isRecovery) {
      return NextResponse.redirect(new URL('/dashboard-redirect', request.url))
    }
  }

  // 6. GUARD: Prevent logged-in users from seeing the login page
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard-redirect', request.url))
  }

  // 7. GUARD: Role-Based Route Protection (RBAC)
  if (user && hasCompletedOnboarding) {
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard-redirect', request.url))
    }
    if (pathname.startsWith('/project-manager') && userRole !== 'project-manager') {
      return NextResponse.redirect(new URL('/dashboard-redirect', request.url))
    }
    if (pathname.startsWith('/viewer') && userRole !== 'viewer') {
      return NextResponse.redirect(new URL('/dashboard-redirect', request.url))
    }
  }

  return supabaseResponse
}