'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const SubHeader = ({ title = '서브페이지' }: { title: string }) => {
  const router = useRouter()

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                뒤로
              </Button>
              <div className="h-6 border-l border-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default SubHeader
