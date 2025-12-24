'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { changePasswordApi } from '@/lib/api/auth-api'
import { ROUTES } from '@/lib/constants/routes'
import { useRouter } from 'next/navigation'
import useDialogStore from '@/store/useDialogStore'
import { useLoading } from '@/contexts/LoadingContext'

/**
 * 관리자 > 비밀번호 변경 페이지
 *
 * 초기 비밀번호(사번)를 사용하는 사용자가
 * 최초 로그인 시 필수로 비밀번호를 변경해야 하는 페이지
 * 사번과 이름으로 본인 확인 후 비밀번호 변경
 **/
const ChangePasswordPage = () => {
  const router = useRouter()
  const { showDialog } = useDialogStore()
  const { showLoading, hideLoading } = useLoading()
  const [userId, setUserId] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 클라이언트 측 유효성 검사
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (newPassword.length < 6) {
      setError('새 비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (newPassword === userId) {
      setError('새 비밀번호는 사번과 달라야 합니다.')
      return
    }

    // 전역 로딩 표시
    showLoading()

    try {
      await changePasswordApi({
        userId: userId.trim(),
        name: name.trim(),
        newPassword,
      })

      // 로딩 숨기고 성공 다이얼로그 표시
      hideLoading()
      showDialog({
        type: 'success',
        title: '비밀번호 변경 완료',
        description: '비밀번호가 성공적으로 변경되었습니다.\n작업장 현황 페이지로 이동합니다.',
        confirmText: '확인',
        onConfirm: () => {
          router.push(ROUTES.ADMIN.WORKPLACE)
        },
      })
    } catch (error) {
      hideLoading()
      setError((error as Error).message)
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
              width={80}
              height={80}
              className="mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900">비밀번호 변경</h1>
            <p className="text-gray-600 mt-2">보안을 위해 초기 비밀번호를 변경해주세요.</p>
            <p className="text-sm text-orange-600 mt-2">※ 이 작업은 필수이며 건너뛸 수 없습니다.</p>
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
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
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

            <button
              type="submit"
              className="w-full bg-primary-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              비밀번호 변경
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordPage
