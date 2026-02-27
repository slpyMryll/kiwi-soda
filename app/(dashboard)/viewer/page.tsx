'use client'
import React from 'react'
import { logout } from '@/lib/actions/auth'
const handleLogout = () => {
    logout()
}
const page = () => {
  return (
    <><div>Viewer Logged in </div>
    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md">Logout</button></>
    
  )
}

export default page