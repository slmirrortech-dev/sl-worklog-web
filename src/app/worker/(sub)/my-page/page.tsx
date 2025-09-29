import React from 'react'
import { getServerSession } from '@/lib/utils/auth-guards'
import { LogOut } from 'lucide-react'
import ButtonLogout from '@/app/worker/(sub)/my-page/_component/ButtonLogout'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

const MyPagePage = async () => {
  const session = await getServerSession()

  return (
    <div className="min-h-[calc(100vh-60px)] flex justify-center bg-gray-50">
      <div className="w-full max-w-sm px-6 py-6 flex flex-col">
        {/* 로그인 정보 */}
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-4">로그인 정보</h1>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">이름</span>
              <span className="font-medium text-lg">{session?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">사번</span>
              <span className="font-medium text-lg">{session?.userId}</span>
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <ButtonLogout />
      </div>
    </div>
  )
}

export default MyPagePage
