'use client'

import React from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

const HomeHeader = () => {
  const router = useRouter()

  return (
    <header className="px-6 py-6 bg-primary-50 flex items-center justify-between">
      <Image src="/logo.png" alt="회사 로고" width={94} height={42} />
      <button
        onClick={() => router.push(ROUTES.WORKER.MY_PAGE)}
        className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
      >
        <User className="w-5 h-5 text-primary-900" />
      </button>
    </header>
  )
}

export default HomeHeader
