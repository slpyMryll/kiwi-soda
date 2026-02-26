import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, has_completed_onboarding')
    .eq('id', user.id) 
    .single()

  if (!profile?.has_completed_onboarding) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  const rolePaths: Record<string, string> = {
    admin: '/admin',
    'project-manager': '/project-manager',
    viewer: '/viewer', 
  }

  const targetPath = rolePaths[profile.role] || '/viewer'
  return NextResponse.redirect(new URL(targetPath, origin))
}