'use client'

import React from 'react'
import useLoadingStore from '@/store/useLoadingStore'

/**
 * 전역 로딩 오버레이
 * - useLoadingStore를 통해 어디서든 showLoading/hideLoading 호출 가능
 */
const GlobalLoading = () => {
  const { isLoading } = useLoadingStore()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-700 font-medium">처리 중입니다...</p>
        </div>
      </div>
    </div>
  )
}

export default GlobalLoading
