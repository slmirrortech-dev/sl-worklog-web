'use client'

import React, { useEffect } from 'react'
import ClassSettingCard from './_component/ClassSettingCard'
import ProcessSettingCard from './_component/ProcessSettingCard'
import LineSettingCard from './_component/LineSettingCard'
import { useLoading } from '@/contexts/LoadingContext'
import { useIsFetching, useQuery } from '@tanstack/react-query'
import { getCurrentUserApi } from '@/lib/api/user-api'
import { usePresenceTracking } from '@/hooks/usePresenceTracking'
import { PRESENCE_CHANNELS } from '@/lib/constants/presence'

const WorkplaceSettingPage = () => {
  const { showLoading, hideLoading } = useLoading()

  const isFetchingWorkClasses = useIsFetching({ queryKey: ['getWorkClassesApi'] })
  const isFetchingFactoryConfig = useIsFetching({ queryKey: ['getFactoryConfigApi'] })
  const isFetchingFactoryLine = useIsFetching({ queryKey: ['getFactoryLineApi'] })

  const allLoaded =
    isFetchingWorkClasses === 0 && isFetchingFactoryConfig === 0 && isFetchingFactoryLine == 0

  useEffect(() => {
    if (allLoaded) {
      hideLoading()
    } else {
      showLoading()
    }
  }, [allLoaded])

  // 현재 로그인한 사용자 정보 가져오기
  const { data: currentUser } = useQuery({
    queryKey: ['getCurrentUserApi'],
    queryFn: getCurrentUserApi,
    select: (response) => response.data,
  })

  // Presence tracking (현재 사용자가 설정 페이지에 있음을 broadcast)
  usePresenceTracking(
    PRESENCE_CHANNELS.WORKPLACE_SETTING,
    currentUser
      ? {
          userId: currentUser.id,
          name: currentUser.name,
          userIdString: currentUser.userId,
          page: 'workplace-setting',
        }
      : null,
  )

  return (
    <div className="flex flex-col space-y-6 pb-8">
      <section className="bg-white rounded-lg shadow-md border border-yellow-200 p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
            <div className="text-3xl text-yellow-600">⚠️</div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              설정을 완료하신 후에는 반드시 이 페이지를 벗어나 주세요.
            </h3>
            <p className="text-sm text-gray-500">
              설정하는 동안 다른 관리자는 작업장 현황 페이지를 이용할 수 없습니다.
            </p>
          </div>
        </div>
      </section>
      {/* 반 & 공정 설정 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="h-[400px]">
          <ClassSettingCard />
        </div>
        <div className="h-[400px]">
          <ProcessSettingCard />
        </div>
      </section>

      {/* 라인 & 린지원 설정 */}
      <section className="grid grid-cols-1 lg:grid-cols-1 gap-6 items-start">
        <div>
          <LineSettingCard />
        </div>
      </section>
    </div>
  )
}

export default WorkplaceSettingPage
