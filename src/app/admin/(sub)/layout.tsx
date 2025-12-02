import React from 'react'
import QueryProvider from '../../../contexts/QueryProvider'
import SubHeader from '@/components/admin/SubHeader'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        <SubHeader title="작업장 설정" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">{children}</div>
      </div>
    </QueryProvider>
  )
}

export default AdminLayout
