import React from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { getServerSession } from '@/lib/utils/auth-guards'
import QueryProvider from '../../../contexts/QueryProvider'

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession()

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader name={session?.name || ''} userId={session?.userId || ''} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">{children}</div>
      </div>
    </QueryProvider>
  )
}

export default AdminLayout
