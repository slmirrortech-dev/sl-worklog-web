'use client'

import React from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const SubHeader = () => {
  const router = useRouter()

  return (
    <header className="sticky top-0 left-0 w-full bg-white border-b border-gray-200 flex justify-between items-center">
      <button
        type="button"
        className="w-14 h-14 flex justify-center items-center"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon />
      </button>
    </header>
  )
}

export default SubHeader
