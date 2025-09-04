'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

// interface ErrorPageProps {
//   error: Error
//   reset: () => void
// }

const UserDetailError = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">직원을 찾을 수 없습니다</h1>
        <Button onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로 돌아가기
        </Button>
      </div>
    </div>
  )
}

export default UserDetailError
