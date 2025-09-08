import React from 'react'
import { User } from 'lucide-react'
import LogoutButton from '@/app/admin/(main)/my-page/_component/LogoutButton'
import MyProfile from '@/app/admin/(main)/my-page/_component/MyProfile'
import { cookies } from 'next/headers'

/** 마이페이지 */
export default async function MyPagePage() {
  const cookieStore = cookies()
  const cookieHeader = cookieStore.toString() // 모든 쿠키를 헤더 문자열로 변환

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/current-user`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  })

  const { data: user } = await res.json()

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
          <MyProfile currentUser={user} />
        </div>
      </div>
    </main>
  )
}
