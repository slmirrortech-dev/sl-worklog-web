'use client'

import React, { useEffect } from 'react'
import ClassSettingCard from './_component/ClassSettingCard'
import ProcessSettingCard from './_component/ProcessSettingCard'
import LineSettingCard from './_component/LineSettingCard'
import { useLoading } from '@/contexts/LoadingContext'
import { useIsFetching } from '@tanstack/react-query'

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
        <div className="h-[700px]">
          <LineSettingCard />
        </div>
      </section>
    </div>
  )
}

export default WorkplaceSettingPage
