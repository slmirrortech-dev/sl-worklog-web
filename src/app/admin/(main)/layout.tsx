import React from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import { getServerSession } from '@/lib/utils/auth-guards'
import QueryProvider from '@/contexts/QueryProvider'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import GlobalDialog from '@/components/GlobalDialog'
import GlobalLoading from '@/components/GlobalLoading'

// 동적 렌더링 강제 (비밀번호 변경 체크 포함)
export const dynamic = 'force-dynamic'

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession()

  // 세션이 없으면 로그인 페이지로
  if (!session) {
    redirect(ROUTES.ADMIN.LOGIN)
  }

  // 비밀번호 변경이 필요하면 비밀번호 변경 페이지로
  if (session.mustChangePassword) {
    redirect(ROUTES.ADMIN.CHANGE_PASSWORD)
  }

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">{children}</div>
      </div>
      {/* 전역 Dialog 및 Loading */}
      <GlobalDialog />
      <GlobalLoading />
    </QueryProvider>
  )
}

export default AdminLayout
