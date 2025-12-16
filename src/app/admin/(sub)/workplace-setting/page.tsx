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
