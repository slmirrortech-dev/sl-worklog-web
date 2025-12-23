'use client'

import React, { useState } from 'react'
import { Shield, Lock, Check, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentUserApi } from '@/lib/api/user-api'
import { updatePasswordApi } from '@/lib/api/auth-api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import useDialogStore from '@/store/useDialogStore'
import useLoadingStore from '@/store/useLoadingStore'

const MyProfile = () => {
  const {
    data: currentUser,
    isError,
    isPending,
  } = useQuery({
    queryKey: ['MyProfileCurrentUser'],
    queryFn: getCurrentUserApi,
    select: (response) => response.data,
  })

  const { showDialog } = useDialogStore()
  const { showLoading, hideLoading } = useLoadingStore()

  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('')

  // 유효성 검사 에러 메시지
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmNewPassword?: string
  }>({})

  // 입력 필드 초기화
  const resetForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setErrors({})
  }

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.'
    }

    if (!newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.'
    } else if (newPassword.length < 6) {
      newErrors.newPassword = '비밀번호는 최소 6자 이상이어야 합니다.'
    } else if (newPassword === currentUser?.userId) {
      newErrors.newPassword = '비밀번호는 사번과 달라야 합니다.'
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다.'
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = '새 비밀번호를 다시 입력해주세요.'
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = '새 비밀번호가 일치하지 않습니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 비밀번호 변경 처리
  const handlePasswordChange = async () => {
    // 유효성 검사
    if (!validateForm()) {
      return
    }

    try {
      showLoading()

      await updatePasswordApi({
        userId: currentUser!.userId,
        currentPassword,
        newPassword,
      })

      hideLoading()

      // 성공 Dialog 표시
      showDialog({
        type: 'success',
        title: '비밀번호 변경 완료',
        description: '비밀번호가 성공적으로 변경되었습니다.',
        confirmText: '확인',
        onConfirm: () => {
          setIsEdit(false)
          resetForm()
        },
      })
    } catch (error: any) {
      hideLoading()

      // 에러 Dialog 표시
      showDialog({
        type: 'error',
        title: '비밀번호 변경 실패',
        description: error.message || '비밀번호 변경에 실패했습니다.',
        confirmText: '확인',
      })
    }
  }

  if (isPending) {
    return (
      <div className="p-6 flex justify-center items-center h-40">
        <p className="text-gray-500">정보를 불러오는 중입니다...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <section className="flex items-center justify-center py-20">
        <p className="text-gray-500">사용자 정보 가져오기에 실패했습니다.</p>
      </section>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">사번</label>
          <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
            {currentUser?.userId}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
            {currentUser?.name}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium ${
              currentUser?.role === 'ADMIN'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-orange-100 text-orange-800 border border-orange-200'
            }`}
          >
            <Shield className="w-4 h-4 mr-1" />
            {currentUser?.role === 'ADMIN' ? '관리자' : '작업반장'}
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          {isEdit ? (
            <div className="space-y-6">
              {/* 현재 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="current">현재 비밀번호</Label>
                <Input
                  id="current"
                  value={currentPassword}
                  type="password"
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, currentPassword: undefined }))
                  }}
                  placeholder="현재 비밀번호를 입력하세요."
                  className="h-10 !text-base"
                />
                {errors.currentPassword && (
                  <p className="text-sm text-red-500">{errors.currentPassword}</p>
                )}
              </div>

              {/* 새 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="new">새 비밀번호</Label>
                <Input
                  id="new"
                  value={newPassword}
                  type="password"
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, newPassword: undefined }))
                  }}
                  placeholder="새 비밀번호를 입력하세요. (최소 6자)"
                  className="h-10 !text-base"
                />
                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
              </div>

              {/* 새 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirm">새 비밀번호 확인</Label>
                <Input
                  id="confirm"
                  value={confirmNewPassword}
                  type="password"
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, confirmNewPassword: undefined }))
                  }}
                  placeholder="새 비밀번호를 한번 더 입력하세요."
                  className="h-10 !text-base"
                />
                {errors.confirmNewPassword && (
                  <p className="text-sm text-red-500">{errors.confirmNewPassword}</p>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 text-base"
                  size="lg"
                  onClick={() => {
                    setIsEdit(false)
                    resetForm()
                  }}
                >
                  <X />
                  취소
                </Button>
                <Button
                  variant="default"
                  className="flex items-center space-x-2 text-base"
                  size="lg"
                  onClick={handlePasswordChange}
                >
                  <Check /> 저장
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="flex items-center space-x-2 px-6 py-3 text-base"
              size="lg"
              onClick={() => {
                setIsEdit(true)
              }}
            >
              <Lock />
              비밀번호 변경하기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyProfile
