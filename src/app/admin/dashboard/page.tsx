'use client'

import React, { useState, useEffect } from 'react'
import { User, Plus, LogOut, Edit3, Trash2 } from 'lucide-react'
import { useAuthCheck, logout } from '@/lib/auth-utils'
import UsersTable from '@/app/admin/dashboard/layouts/users-table/UsersTable'

interface Employee {
  id: string
  employeeId: string
  name: string
  createdAt: string
}

const AdminDashboardPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

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

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault()

    // 중복 사번 체크
    if (employees.find(emp => emp.employeeId === employeeId)) {
      alert('이미 등록된 사번입니다.')
      return
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      employeeId: employeeId,
      name: employeeName,
      createdAt: new Date().toISOString(),
    }

    const updatedEmployees = [...employees, newEmployee]
    setEmployees(updatedEmployees)
    localStorage.setItem('employees', JSON.stringify(updatedEmployees))

    // 폼 초기화
    setEmployeeId('')
    setEmployeeName('')
    setShowAddForm(false)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeId(employee.employeeId)
    setEmployeeName(employee.name)
    setShowAddForm(true)
  }

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingEmployee) return

    // 다른 직원과 사번이 중복되는지 체크
    if (
      employees.find(
        emp => emp.employeeId === employeeId && emp.id !== editingEmployee.id
      )
    ) {
      alert('이미 등록된 사번입니다.')
      return
    }

    const updatedEmployees = employees.map(emp =>
      emp.id === editingEmployee.id
        ? { ...emp, employeeId, name: employeeName }
        : emp
    )

    setEmployees(updatedEmployees)
    localStorage.setItem('employees', JSON.stringify(updatedEmployees))

    // 폼 초기화
    setEmployeeId('')
    setEmployeeName('')
    setShowAddForm(false)
    setEditingEmployee(null)
  }

  const handleDeleteEmployee = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const updatedEmployees = employees.filter(emp => emp.id !== id)
      setEmployees(updatedEmployees)
      localStorage.setItem('employees', JSON.stringify(updatedEmployees))
    }
  }

  const cancelEdit = () => {
    setEmployeeId('')
    setEmployeeName('')
    setShowAddForm(false)
    setEditingEmployee(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              관리자 대시보드
            </h1>
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
