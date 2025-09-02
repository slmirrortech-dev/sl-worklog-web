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
  const [_employees, _setEmployees] = useState<Employee[]>([])
  const [_showAddForm, _setShowAddForm] = useState(false)
  const [_employeeId, _setEmployeeId] = useState('')
  const [_employeeName, _setEmployeeName] = useState('')
  const [_editingEmployee, _setEditingEmployee] = useState<Employee | null>(null)

  // 로딩 중이거나 인증되지 않았다면 빈 페이지 표시
  // if (isLoading || !user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-lg">로딩 중...</div>
  //     </div>
  //   )
  // }

  const handleLogout = () => {
    logout()
  }

  const _handleAddEmployee = (_e: React.FormEvent) => {
    // Legacy function - not used
  }

  const _handleEditEmployee = (_employee: Employee) => {
    // Legacy function - not used
  }

  const _handleUpdateEmployee = (_e: React.FormEvent) => {
    // Legacy function - not used
  }

  const _handleDeleteEmployee = (_id: string) => {
    // Legacy function - not used
  }

  const _cancelEdit = () => {
    // Legacy function - not used
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
