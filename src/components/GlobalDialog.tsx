'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import useDialogStore from '@/store/useDialogStore'

/**
 * 전역 Dialog 컴포넌트
 * - useDialogStore를 통해 어디서든 호출 가능
 * - 3가지 타입: success(성공), warning(주의), error(에러)
 * - 확인/취소 버튼 선택적 표시
 */
const GlobalDialog = () => {
  const {
    isOpen,
    type,
    title,
    description,
    showCancel,
    cancelText,
    confirmText,
    onCancel,
    onConfirm,
    isLoading,
    hideDialog,
  } = useDialogStore()

  // 타입별 아이콘 및 색상
  const iconConfig = {
    success: {
      icon: <CheckCircle className="w-7 h-7 text-green-500" />,
      bgColor: 'bg-green-50',
    },
    warning: {
      icon: <AlertTriangle className="w-7 h-7 text-primary-500" />,
      bgColor: 'bg-primary-50',
    },
    error: {
      icon: <AlertCircle className="w-7 h-7 text-red-500" />,
      bgColor: 'bg-red-100',
    },
  }

  const config = iconConfig[type]

  const handleCancel = () => {
    hideDialog()
    // hideDialog 후 다음 tick에 실행하여 상태 정리 보장
    setTimeout(() => {
      onCancel?.()
    }, 0)
  }

  const handleConfirm = () => {
    hideDialog()
    // hideDialog 후 다음 tick에 실행하여 상태 정리 보장
    setTimeout(() => {
      onConfirm?.()
    }, 0)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={hideDialog}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div
              className={`w-14 h-14 ${config.bgColor} rounded-full flex items-center justify-center`}
            >
              {config.icon}
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-center">
            {description.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < description.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex !flex-row">
          {showCancel && (
            <button
              disabled={isLoading}
              className={`${
                isLoading && 'opacity-50'
              } text-lg h-12 text-primary-900 border-1 border-primary-900 bg-white flex-1 rounded-md`}
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}

          <button
            disabled={isLoading}
            className={`${
              isLoading && 'opacity-50'
            } text-lg h-12 bg-primary-900 flex-1 text-white rounded-md`}
            onClick={handleConfirm}
          >
            {isLoading ? '로딩 중...' : confirmText}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default GlobalDialog
