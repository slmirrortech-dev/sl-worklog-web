'use client'

import React, { useEffect, useRef, useState } from 'react'
import ClassSettingCard from './_component/ClassSettingCard'
import ProcessSettingCard from './_component/ProcessSettingCard'
import LineSettingCard from './_component/LineSettingCard'
import { useLoading } from '@/contexts/LoadingContext'
import { useIsFetching, useQuery } from '@tanstack/react-query'
import { supabaseClient } from '@/lib/supabase/client'
import { getCurrentUserApi } from '@/lib/api/user-api'

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

  const tabIdRef = useRef(crypto.randomUUID())

  // 현재 로그인한 사용자 정보 가져오기
  const { data: currentUser } = useQuery({
    queryKey: ['getCurrentUserApi'],
    queryFn: getCurrentUserApi,
    select: (response) => response.data,
  })

  useEffect(() => {
    if (!currentUser) return

    const channel = supabaseClient.channel('presence:workplace-setting', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('현재 접속자', state)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: currentUser.id,
            name: currentUser.name,
            userIdString: currentUser.userId,
            tabId: tabIdRef.current,
            page: 'workplace-setting',
            joinedAt: Date.now(),
          })
        }
      })

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [currentUser])

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
