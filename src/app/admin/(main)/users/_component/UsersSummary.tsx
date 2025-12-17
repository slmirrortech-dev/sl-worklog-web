'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getUsersApi } from '@/lib/api/user-api'

const UsersSummary = ({}) => {
  const router = useRouter()

  const { data: allUsersTotalCount } = useQuery({
    queryKey: ['getUsersApi'],
    queryFn: () => getUsersApi({ page: 1, pageSize: 1 }),
    select: (response) => {
      return response.data.totalCount || 0
    },
  })

  const { data: adminTotalCount } = useQuery({
    queryKey: ['getAdminApi'],
    queryFn: () => getUsersApi({ page: 1, pageSize: 1, role: 'ADMIN' }),
    select: (response) => {
      return response.data.totalCount || 0
    },
  })

  const { data: managerTotalCount } = useQuery({
    queryKey: ['getManagerApi'],
    queryFn: () => getUsersApi({ page: 1, pageSize: 1, role: 'MANAGER' }),
    select: (response) => {
      return response.data.totalCount || 0
    },
  })

  const { data: workerTotalCount } = useQuery({
    queryKey: ['getWorkerApi'],
    queryFn: () => getUsersApi({ page: 1, pageSize: 1, role: 'WORKER' }),
    select: (response) => {
      return response.data.totalCount || 0
    },
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">전체 직원 목록</h2>
          <div className="flex items-center gap-4 mt-2 text-base text-gray-500">
            <span className="whitespace-nowrap">총 {allUsersTotalCount}명</span>|
            <span className="whitespace-nowrap">관리자 {adminTotalCount}명</span>|
            <span className="whitespace-nowrap">작업반장 {managerTotalCount}명</span>|
            <span className="whitespace-nowrap">작업자 {workerTotalCount}명</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="default"
            size="lg"
            onClick={() => router.push('/admin/users/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 font-medium shadow-sm text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            신규 등록
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UsersSummary
