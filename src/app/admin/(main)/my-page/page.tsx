import React from 'react'
import { User } from 'lucide-react'
import LogoutButton from '@/app/admin/(main)/my-page/_component/LogoutButton'
import MyProfile from '@/app/admin/(main)/my-page/_component/MyProfile'
import { getServerSession } from '@/lib/utils/auth-guards'

/** 마이페이지 */
export default async function MyPagePage() {
  const session = await getServerSession()

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* 로그아웃 버튼 */}
        <LogoutButton />

        {/* 사용자 정보 카드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-600" />내 정보
            </h2>
          </div>
          <MyProfile
            currentUser={{
              id: session!.id,
              userId: session!.userId,
              name: session!.name,
              role: session!.role,
            }}
          />
        </div>
      </div>
    </main>
  )
}
