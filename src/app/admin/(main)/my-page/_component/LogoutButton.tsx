'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { logoutApi } from '@/lib/api/auth-api'
import { ROUTES } from '@/lib/constants/routes'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useDialogStore from '@/store/useDialogStore'

const LogoutButton = () => {
  const router = useRouter()
  const { showDialog } = useDialogStore()

  return (
    <div className="flex justify-end">
      <Button
        variant="outline"
        onClick={() => {
          showDialog({
            type: 'warning',
            title: '로그아웃',
            description: '로그아웃하시겠습니까?',
            showCancel: true,
            cancelText: '취소',
            confirmText: '로그아웃',
            onConfirm: async () => {
              try {
                await logoutApi()
                router.push(ROUTES.ADMIN.LOGIN)
              } catch (error) {
                console.error(error)
                showDialog({
                  type: 'error',
                  title: '로그아웃 실패',
                  description: '로그아웃에 실패했습니다.',
                  confirmText: '확인',
                })
              }
            },
          })
        }}
        className="flex items-center space-x-2 px-6 py-3 text-base border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        size="lg"
      >
        <LogOut className="h-5 w-5" />
        <span>로그아웃</span>
      </Button>
    </div>
  )
}

export default LogoutButton
