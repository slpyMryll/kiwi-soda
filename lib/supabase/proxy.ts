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

  // 2. Fetch profile data if user exists - Try cookie cache first
  const roleCookie = request.cookies.get('on-track-role')?.value;
  let userRole = roleCookie || 'viewer';
  let hasCompletedOnboarding = !!roleCookie; // If we have a role cookie, they've likely onboarded

  // If no cookie, we MUST hit the database once to seed the cache
  if (user && !roleCookie) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, has_completed_onboarding')
      .eq('id', user.id)
      .single()
    
    userRole = String(profile?.role || 'viewer');
    hasCompletedOnboarding = profile?.has_completed_onboarding || false;

    // Seed the cookie for the next request
    if (hasCompletedOnboarding) {
      supabaseResponse.cookies.set('on-track-role', userRole, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        httpOnly: true
      });
    }
  }

  // Helper for role-based paths
  const getRolePath = (role: string) => {
    const rolePaths: Record<string, string> = {
      admin: '/admin',
      'project-manager': '/project-manager',
      viewer: '/viewer', 
    }
    return rolePaths[role] || '/viewer'
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
      return NextResponse.redirect(new URL(getRolePath(userRole), request.url))
    }
  }

  // 6. GUARD: Prevent logged-in users from seeing login or landing page if already onboarded
  if (user && (pathname === '/login' || pathname === '/')) {
    if (!hasCompletedOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    return NextResponse.redirect(new URL(getRolePath(userRole), request.url))
  }

  // 7. GUARD: Role-Based Route Protection (RBAC)
  if (user && hasCompletedOnboarding) {
    const targetPath = getRolePath(userRole);
    
    // If user is on the wrong dashboard, send them to the right one
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL(targetPath, request.url))
    }
    if (pathname.startsWith('/project-manager') && userRole !== 'project-manager') {
      return NextResponse.redirect(new URL(targetPath, request.url))
    }
    if (pathname.startsWith('/viewer') && userRole !== 'viewer') {
      return NextResponse.redirect(new URL(targetPath, request.url))
    }
  }

  return supabaseResponse
}