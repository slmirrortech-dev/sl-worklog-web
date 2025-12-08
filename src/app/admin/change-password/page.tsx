'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { changePasswordApi } from '@/lib/api/auth-api'
import { ROUTES } from '@/lib/constants/routes'
import { apiFetch } from '@/lib/api/api-fetch'

/**
 * 관리자 > 비밀번호 변경 페이지
 *
 * 초기 비밀번호(사번)를 사용하는 사용자가
 * 최초 로그인 시 필수로 비밀번호를 변경해야 하는 페이지
 * 사번과 이름으로 본인 확인 후 비밀번호 변경
 **/
const ChangePasswordPage = () => {
  const [userId, setUserId] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)
  const router = useRouter()

  // 페이지 로드 시 비밀번호 변경 필요 여부 확인
  useEffect(() => {
    const checkPasswordChangeRequired = async () => {
      try {
        const response = await apiFetch<{ mustChangePassword: boolean }>(
          '/api/auth/check-password-change',
        )
        if (!response.mustChangePassword) {
          // 이미 비밀번호를 변경한 경우 작업장 현황으로 이동
          window.location.href = ROUTES.ADMIN.WORKPLACE
        } else {
          setIsChecking(false)
        }
      } catch (error) {
        console.error('비밀번호 변경 여부 확인 실패:', error)
        setIsChecking(false)
      }
    }

    checkPasswordChangeRequired()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // 클라이언트 측 유효성 검사
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    if (newPassword === userId) {
      setError('새 비밀번호는 사번과 달라야 합니다.')
      setIsLoading(false)
      return
    }

    try {
      await changePasswordApi({
        userId: userId.trim(),
        name: name.trim(),
        newPassword,
      })

      setSuccess('비밀번호가 성공적으로 변경되었습니다. 잠시 후 작업장 현황 페이지로 이동합니다.')

      // 2초 후 작업장 현황 페이지로 이동
      setTimeout(() => {
        window.location.href = ROUTES.ADMIN.WORKPLACE
      }, 2000)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // 비밀번호 변경 필요 여부 확인 중
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md px-8 py-10">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="회사 로고"
              width={80}
              height={80}
              className="mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900">비밀번호 변경</h1>
            <p className="text-gray-600 mt-2">
              보안을 위해 초기 비밀번호를 변경해주세요.
            </p>
            <p className="text-sm text-orange-600 mt-2">
              ※ 이 작업은 필수이며 건너뛸 수 없습니다.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                새 비밀번호
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                새 비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordPage
