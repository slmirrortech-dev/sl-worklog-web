'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { logoutApi } from '@/lib/api/auth-api'
import { ROUTES } from '@/lib/constants/routes'
import { useRouter } from 'next/navigation'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import { useLoading } from '@/contexts/LoadingContext'

const ButtonLogout = () => {
  const { showLoading } = useLoading()
  const router = useRouter()
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)

  return (
    <>
      <button
        className="w-full bg-white border border-red-300 text-red-600 py-4 px-6 text-lg font-medium rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center mt-8"
        onClick={async () => {
          showLoading()
          setIsAlertDialogOpen(false)
          try {
            await logoutApi()
            router.push(ROUTES.WORKER.LOGIN)
          } catch (error) {
            console.error(error)
            setIsAlertDialogOpen(true)
          }
        }}
      >
        <LogOut className="w-5 h-5 mr-2" />
        로그아웃
      </button>
      {/* 오류 발생 시 모달 알림 */}
      <CustomAlertDialog
        isOpen={isAlertDialogOpen}
        setIsOpen={setIsAlertDialogOpen}
        title={'로그아웃 실패'}
        desc={'로그아웃 중 오류가 발생했습니다. \n잠시 후 다시 시도해주세요.'}
      />
    </>
  )
}

export default ButtonLogout
