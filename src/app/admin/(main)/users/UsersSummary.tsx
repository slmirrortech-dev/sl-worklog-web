'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

const UsersSummary = () => {
  const router = useRouter()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">전체 직원 목록</h2>
          <div className="flex items-center gap-4 mt-2 text-base text-gray-500">
            <span className="whitespace-nowrap">총 100명</span>
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
