'use client'

import React from 'react'
import { logoutApi } from '@/lib/api/auth-api'
import { useRouter } from 'next/navigation'

const LogoutButton = () => {
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        try {
          await logoutApi()
          router.replace('/')
        } catch (error) {
          console.error(error)
        }
      }}
      className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      로그아웃
    </button>
  )
}

export default LogoutButton
