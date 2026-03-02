'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getRoleRedirectPath(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, has_completed_onboarding')
    .eq('id', userId)
    .single()

  if (!profile?.has_completed_onboarding) return '/onboarding'

  const rolePaths: Record<string, string> = {
    admin: '/admin',
    'project-manager': '/project-manager',
    viewer: '/viewer', // Default role
  }

  return rolePaths[profile.role] || '/viewer'
}

export async function signInWithGoogle(origin: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: { hd: 'vsu.edu.ph', prompt: 'select_account' }
    }
  })
  if (error) return { error: error.message }
  if (data?.url) redirect(data.url)
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email.toLowerCase().endsWith('@vsu.edu.ph')) {
    return { error: "Access restricted to @vsu.edu.ph accounts only." }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password })

  if (authError || !user) return { error: authError?.message || "Login failed" }

  const path = await getRoleRedirectPath(supabase, user.id)
  redirect(path)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password/callback`,
  })
  if (error) return { error: error.message }
  return { success: true }
}