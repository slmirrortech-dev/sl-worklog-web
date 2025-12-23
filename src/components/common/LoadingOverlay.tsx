'use client'

import React from 'react'
import Image from 'next/image'
import { useLoading } from '@/contexts/LoadingContext'

const LoadingOverlay = () => {
  const { isLoading } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
      {/* 로고 회전 */}
      <div className="animate-bounce [animation-duration:0.7s] w-24 h-24 rounded-full bg-white flex items-center justify-center">
        <Image src="/spinner-logo.png" alt="회사 로고" width={60} height={60} priority />
      </div>
    </div>
  )
}

export default LoadingOverlay
