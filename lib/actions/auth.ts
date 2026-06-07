'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { cookies } from 'next/headers'

import { ROLE_REDIRECTS, UserRole } from '@/types/navigation'

async function getRoleRedirectPath(supabase: any, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, has_completed_onboarding')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return '/onboarding';
  }

  if (!profile.has_completed_onboarding) return '/onboarding'

  const role = (profile.role as UserRole) || 'viewer';
  
  // Cache the role in a cookie for the middleware to read instantly
  const cookieStore = await cookies();
  cookieStore.set('on-track-role', role, { 
    path: '/', 
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
    httpOnly: true 
  });

  return ROLE_REDIRECTS[role] || '/viewer'
}

export async function signInWithGoogle(origin: string) {
  try {
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
    return { error: "No redirect URL returned" }
  } catch (err: any) {
    if (err.message === 'NEXT_REDIRECT') throw err;
    return { error: err.message || "Google Sign-In failed" }
  }
}

export async function signInWithEmail(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: "Email and password are required." }
    }

    if (!email.toLowerCase().endsWith('@vsu.edu.ph')) {
      return { error: "Access restricted to @vsu.edu.ph accounts only." }
    }

    const supabase = await createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data?.user) return { error: authError?.message || "Login failed" }

    const path = await getRoleRedirectPath(supabase, data.user.id)
    return { success: true, path }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred during login" }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const cookieStore = await cookies();
  cookieStore.delete('on-track-role');

  return { success: true };
}
export async function resetPassword(email: string, origin: string) {
  const supabase = await createClient()
  const callbackUrl = new URL(`${origin}/auth/callback`)
  callbackUrl.searchParams.set('next', '/update-password')
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl.toString(),
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