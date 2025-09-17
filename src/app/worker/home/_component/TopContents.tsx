'use client'

import React from 'react'
import HeadText from '@/app/worker/home/_component/HeadText'
import { SessionUser } from '@/lib/core/session'
import { ROUTES } from '@/lib/constants/routes'
import { useRouter } from 'next/navigation'

const TopContents = ({ currentUser }: { currentUser: SessionUser | null }) => {
  const router = useRouter()

  return (
    <div>
      <HeadText username={currentUser?.name} text={'오늘도 안전하고\n힘찬 하루 되세요!'} />

      <button
        onClick={() => router.push(ROUTES.WORKER.START)}
        type="button"
        className="w-full bg-primary-900 text-white py-4 px-6 text-2xl font-medium rounded-xl focus:outline-none transition-colors"
      >
        작업 시작하기
      </button>
    </div>
  )
}

export default TopContents
