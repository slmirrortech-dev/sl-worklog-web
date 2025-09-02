'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { logout } from '@/lib/auth-utils'
import UsersTable from '@/app/admin/dashboard/layouts/users-table/UsersTable'

interface Employee {
  id: string
  employeeId: string
  name: string
  createdAt: string
}

const AdminDashboardPage = () => {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">관리자 대시보드</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 사용자 목록 */}
        <UsersTable />
      </div>
    </div>
  )
}

export default AdminDashboardPage
