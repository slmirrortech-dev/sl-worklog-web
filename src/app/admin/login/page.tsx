'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { loginAdminApi } from '@/lib/api/auth-api'
import { ROUTES } from '@/lib/constants/routes'

/**
 * 관리자 > 로그인 페이지
 **/
const AdminLoginPage = () => {
  const [userId, setUserId] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const response = await loginAdminApi({
        userId: userId.trim(),
        password: password,
      })

      // mustChangePassword 플래그 확인
      if (response.mustChangePassword) {
        // 초기 비밀번호 변경 필요
        window.location.href = ROUTES.ADMIN.CHANGE_PASSWORD
      } else {
        // 일반 로그인 - 작업장 현황으로 이동
        window.location.href = ROUTES.ADMIN.WORKPLACE
      }
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md px-8 py-10">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="회사 로고"
              width={100}
              height={100}
              className="mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
            <p className="text-gray-600 mt-2">관리자 계정으로 로그인하세요</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                사번
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="사번을 입력하세요"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
