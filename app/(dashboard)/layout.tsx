import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id) 
    .single();

  return (
    <div className="flex min-h-screen bg-bg-main">
      <aside className="w-64 bg-green-dark text-white p-6 flex flex-col shadow-xl">
        <div className="mb-8">
          <h1 className="text-white text-2xl">OnTrack</h1>
          <p className="text-xs opacity-60 mt-1">USSC Management</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="py-2 px-4 bg-white/10 rounded-lg">
            <p className="text-[10px] uppercase tracking-wider opacity-50">Current Role</p>
            <p className="text-sm font-bold">{profile?.role || 'viewer'}</p>
          </div>
          {/* Add Nav Links here */}
        </nav>

        <button 
          onClick={logout} 
          className="mt-auto w-full text-left p-3 text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Logout
        </button>
      </aside>
      
      <main className="flex-1 p-10">
        <header className="mb-8">
          <h2 className="text-2xl">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</h2>
        </header>
        {children}
      </main>
    </div>
  );
}