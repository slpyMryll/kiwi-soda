"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: name,
        username: username,
        has_completed_onboarding: true
      })

      await supabase.auth.updateUser({ password: password })

      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-main p-6">
      <form onSubmit={handleComplete} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-green-dark">Finish Setting Up</h1>
        <p className="text-sm text-gray-500">Create a password to use the manual login form next time.</p>
        
        <input placeholder="Full Name" className="w-full border p-4 rounded-xl" onChange={e => setName(e.target.value)} required />
        <input placeholder="Username" className="w-full border p-4 rounded-xl" onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Create OnTrack Password" className="w-full border p-4 rounded-xl" onChange={e => setPassword(e.target.value)} required />
        
        <button className="w-full bg-green-dark text-white py-4 rounded-xl font-bold">Complete Setup</button>
      </form>
    </main>
  )
}