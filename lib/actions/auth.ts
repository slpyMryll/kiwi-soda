'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { cookies } from 'next/headers'

async function getRoleRedirectPath(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, has_completed_onboarding')
    .eq('id', userId)
    .single()

  if (!profile?.has_completed_onboarding) return '/onboarding'

  const role = profile.role || 'viewer';
  
  // Cache the role in a cookie for the middleware to read instantly
  const cookieStore = await cookies();
  cookieStore.set('on-track-role', role, { 
    path: '/', 
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
    httpOnly: true 
  });

  const rolePaths: Record<string, string> = {
    admin: '/admin',
    'project-manager': '/project-manager',
    viewer: '/viewer',
  }

  return rolePaths[role] || '/viewer'
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
  return { success: true, path }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const cookieStore = await cookies();
  cookieStore.delete('on-track-role');
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(email: string, origin: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.updateUser({ password });

  if (error || !user) return { error: error?.message || 'Update failed' };

  const path = await getRoleRedirectPath(supabase, user.id);
  return { success: true, path };
}