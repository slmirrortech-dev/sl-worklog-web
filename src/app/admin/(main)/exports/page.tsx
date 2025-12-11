'use client'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import WorkplaceLog from '@/app/admin/(main)/exports/_component/WorkplaceLog'
import DefectLog from '@/app/admin/(main)/exports/_component/DefectLog'

const ExportsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 ?tab= 값을 가져옴. 없으면 기본값 'workplace'
  const currentTab = searchParams.get('tab') || 'workplace'

  // 탭 변경 핸들러
  const handleTabChange = (tab: string) => {
    // URL만 변경하고 페이지 리로드는 하지 않음
    router.push(`?tab=${tab}`, { scroll: false })
  }

  return (
    <div className="w-full space-y-6 mb-24">
      {/* --- 상단 탭 영역 --- */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange('workplace')}
          className={cn(
            'px-6 pb-3 text-base font-medium transition-colors border-b-2',
            currentTab === 'workplace'
              ? 'border-blue-500 text-blue-600' // 활성화 스타일
              : 'border-transparent text-gray-500 hover:text-gray-700', // 비활성화 스타일
          )}
        >
          작업장 현황 백업
        </button>
        <button
          onClick={() => handleTabChange('defect')}
          className={cn(
            'px-6 pb-3 text-base font-medium transition-colors border-b-2',
            currentTab === 'defect'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          불량 유출 기록
        </button>
      </div>

      {/* --- 탭에 따른 컨텐츠 영역 --- */}
      <div className="mt-4">
        {currentTab === 'workplace' && <WorkplaceLog />}

        {currentTab === 'defect' && <DefectLog />}
      </div>
    </div>
  )
}

export default ExportsPage
