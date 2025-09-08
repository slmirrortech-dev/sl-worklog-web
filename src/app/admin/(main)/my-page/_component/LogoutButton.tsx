'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { logoutApi } from '@/lib/api/auth-api'
import { ROUTES } from '@/lib/constants/routes'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

const LogoutButton = () => {
  const router = useRouter()

  return (
    <div className="flex justify-end">
      <Button
        variant="outline"
        onClick={async () => {
          if (confirm('로그아웃하시겠습니까?')) {
            try {
              await logoutApi()
              router.push(ROUTES.ADMIN.LOGIN)
            } catch (error) {
              console.error(error)
              alert('로그아웃에 실패했습니다.')
            }
          }
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
