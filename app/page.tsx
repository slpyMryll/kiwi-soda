'use client'
import { redirect } from 'next/navigation'

export default function Home() {
  const handleSigninBtn = async () => {
    redirect('/login')
  }
  return (
    <div>
      <h1>HomePage</h1>
      <button onClick={handleSigninBtn}>Go to Sign in page</button>
    </div>
  );
}
