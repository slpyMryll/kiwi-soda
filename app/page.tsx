import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface-brand text-white p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-white text-6xl mb-6">OnTrack</h1>
        <p className="text-xl mb-10 opacity-90">
          Fostering trust through transparency. The official project and budget tracker for the VSU USSC.
        </p>
        
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link 
              href="/dashboard-redirect" 
              className="bg-white text-green-dark px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="bg-green-dark border border-white/20 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors"
            >
              Sign In as Guest
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}