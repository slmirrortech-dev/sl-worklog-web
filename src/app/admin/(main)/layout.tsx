import React from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { cookies } from 'next/headers'

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = cookies()
  const cookieHeader = cookieStore.toString() // 모든 쿠키를 헤더 문자열로 변환

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/current-user`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  })

  const { data: user } = await res.json()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader name={user.name} userId={user.userId} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">{children}</div>
    </div>
  )
}

export default AdminLayout
