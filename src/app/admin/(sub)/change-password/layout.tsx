import React from 'react'
import SubHeader from '@/components/admin/SubHeader'
import { getServerSession } from '@/lib/utils/auth-guards'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession()

  // 세션이 없으면 로그인 페이지로
  if (!session) {
    redirect(ROUTES.ADMIN.LOGIN)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SubHeader title="초기비밀번호 설정" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">{children}</div>
    </div>
  )
}

export default AdminLayout
