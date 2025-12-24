import React from 'react'
import { getServerSession } from '@/lib/utils/auth-guards'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

const ChangePasswordWrapper = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession()

  // 세션이 없으면 로그인 페이지로
  if (!session) {
    redirect(ROUTES.ADMIN.LOGIN)
  }

  // 비밀번호 변경이 필요하지 않으면 작업장으로 리디렉션
  if (!session.mustChangePassword) {
    redirect(ROUTES.ADMIN.WORKPLACE)
  }

  return <>{children}</>
}

export default ChangePasswordWrapper