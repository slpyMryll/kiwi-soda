import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard-redirect'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const targetUrl = new URL(next, origin)

      if (next.startsWith('/update-password')) {
        targetUrl.searchParams.set('verified', 'true')
      }
      
      return NextResponse.redirect(targetUrl.toString())
    }
  }
  
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}