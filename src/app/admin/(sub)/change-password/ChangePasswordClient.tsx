'use client'

import React from 'react'
import SubHeader from '@/components/admin/SubHeader'
import { logoutApi } from '@/lib/api/auth-api'
import { ROUTES } from '@/lib/constants/routes'
import { useRouter } from 'next/navigation'

const ChangePasswordClient = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  const handleBack = async () => {
    // 뒤로가기 시 로그아웃 후 로그인 페이지로 이동
    await logoutApi()
    router.push(ROUTES.ADMIN.LOGIN)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SubHeader title="초기비밀번호 설정" onBack={handleBack} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">{children}</div>
    </div>
  )
}

export default ChangePasswordClient
