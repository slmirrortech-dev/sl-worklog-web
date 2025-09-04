import React from 'react'
import UsersTable from '@/app/admin/dashboard/layouts/users-table/UsersTable'
import MainHeader from '@/components/admin/MainHeader'

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 사용자 목록 */}
        <UsersTable />
      </div>
    </div>
  )
}

export default AdminDashboardPage
