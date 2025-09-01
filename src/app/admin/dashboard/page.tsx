'use client'

import React, { useState, useEffect } from 'react'
import { User, Plus, LogOut, Edit3, Trash2 } from 'lucide-react'
import { useAuthCheck, logout } from '@/lib/auth-utils'

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

  // 세션 기반 인증 확인 (관리자만 접근 가능)
  const { user, isLoading } = useAuthCheck(['ADMIN'])

  // 직원 데이터 로드
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees')
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees))
    }
  }, [])

  // 로딩 중이거나 인증되지 않았다면 빈 페이지 표시
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

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
      createdAt: new Date().toISOString()
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
    if (employees.find(emp => emp.employeeId === employeeId && emp.id !== editingEmployee.id)) {
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
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-primary-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">총 직원 수</h3>
                <p className="text-2xl font-semibold text-gray-900">{employees.length}명</p>
              </div>
            </div>
          </div>
        </div>

        {/* 직원 등록 섹션 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">직원 관리</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                직원 등록
              </button>
            </div>
          </div>

          {/* 직원 등록/수정 폼 */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <form onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사번
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="직원 사번을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="직원 이름을 입력하세요"
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingEmployee ? '수정' : '등록'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 직원 목록 */}
          <div className="px-6 py-4">
            {employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">사번</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">이름</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">등록일</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{employee.employeeId}</td>
                        <td className="py-3 px-4 text-gray-900">{employee.name}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(employee.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="p-1 text-gray-400 hover:text-primary-600"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                등록된 직원이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage