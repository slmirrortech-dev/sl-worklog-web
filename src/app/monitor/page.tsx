'use client'

// 동적 렌더링 강제
import {
  getAllFactoryLineApi,
  getFactoryConfigApi,
  getWorkClassesApi,
} from '@/lib/api/workplace-api'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
// import { getMonitorLineWithProcessApi } from '@/lib/api/line-with-process-api'
import Image from 'next/image'
import { Maximize, Minimize } from 'lucide-react'
import { colorWorkStatus, displayWorkStatus } from '@/lib/utils/shift-status'
import { ShiftType } from '@prisma/client'
import AreaWaitingWorker from '@/app/monitor/_component/AreaWaitingWorker'
// import useMonitorLineDataSync from '@/hooks/useMonitorLineDataSync'
import { useLoading } from '@/contexts/LoadingContext'
import { useFactoryLineRealtime } from '@/hooks/useAllFactoryLineRealtime'

const MonitorPage = () => {
  useFactoryLineRealtime()
  const { showLoading, hideLoading } = useLoading()
  const [viewType, setViewType] = useState<ShiftType>('DAY')
  const [viewClassId, setViewClassId] = useState<string>('')

  const [maxLength, setMaxLength] = useState<number>(0)
  const [filteredFactoryLines, setFilteredFactoryLines] = useState<any[]>([])

  // api 호출
  const { data: classesData, isPending: isPendingClasses } = useQuery({
    queryKey: ['getWorkClassesApi'],
    queryFn: getWorkClassesApi,
    select: (response) => response.data,
  })

  const { data: allFactoryLineData, isPending: isPendingAllFactoryLineData } = useQuery({
    queryKey: ['getAllFactoryLineApi'],
    queryFn: getAllFactoryLineApi,
    select: (response) => response.data,
  })

  const { data: factoryConfigData, isPending: isPendingFactoryConfig } = useQuery({
    queryKey: ['getFactoryConfigApi'],
    queryFn: getFactoryConfigApi,
    select: (response) => response.data?.processCount || 0,
  })

  useEffect(() => {
    if (classesData && classesData.length > 0) {
      setViewClassId(classesData[0].id)
    } else {
      setViewClassId('')
    }
  }, [classesData])

  useEffect(() => {
    if (isPendingClasses || isPendingAllFactoryLineData || isPendingFactoryConfig) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isPendingClasses, isPendingAllFactoryLineData, isPendingFactoryConfig])

  useEffect(() => {
    if (viewClassId && allFactoryLineData && allFactoryLineData.length > 0) {
      setFilteredFactoryLines(allFactoryLineData.filter((item) => item.workClassId === viewClassId))
    }
  }, [allFactoryLineData, viewClassId])

  // const { data, refetch, isPending } = useQuery({
  //   queryKey: ['monitor', viewClassId],
  //   queryFn: getMonitorLineWithProcessApi,
  //   select: (response) => {
  //     return response.data.filter((item) => item.classNo === viewClassId)
  //   },
  // })

  // useEffect(() => {
  //   if (isPending) {
  //     showLoading()
  //   } else {
  //     hideLoading()
  //   }
  // }, [isPending])
  //
  // // 실시간 데이터 동기화
  // useMonitorLineDataSync(() => refetch())
  //
  // useEffect(() => {
  //   if (data) {
  //     setMaxLength(Math.max(...data.flatMap((item) => item.processes.length)))
  //   }
  // }, [data])

  const [isFullscreen, setIsFullscreen] = useState(false)

  // 전체화면 상태 변화 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    console.log('filteredFactoryLines', filteredFactoryLines)
  }, [filteredFactoryLines])

  return (
    <>
      {isFullscreen && (
        <style jsx global>{`
          /* ( 크롬, 사파리, 오페라, 엣지 ) 동작 */
          *::-webkit-scrollbar {
            display: none;
          }

          * {
            -ms-overflow-style: none; /* 인터넷 익스플로러 */
            scrollbar-width: none; /* 파이어폭스 */
          }
        `}</style>
      )}
      <main
        className="w-screen bg-white overflow-hidden"
        style={{
          height: isFullscreen ? '100vh' : 'calc(100vh - 6rem)',
        }}
      >
        {filteredFactoryLines &&
          filteredFactoryLines.length > 0 &&
          factoryConfigData &&
          factoryConfigData > 0 && (
            <div
              className="grid h-full w-full"
              style={{
                gridTemplateColumns: `50px repeat(${filteredFactoryLines.length}, minmax(0, 1fr))`,
                gridTemplateRows: `minmax(100px, 1.2fr) repeat(${factoryConfigData}, 1fr)`,
              }}
            >
              {/* 좌상단 코너 - 빈 셀 */}
              <div className="bg-slate-200 border-b-1 border-r-1 border-white flex items-center justify-center">
                <span
                  className="font-bold text-gray-600"
                  style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1.25rem)' }}
                ></span>
              </div>

              {/* 상단 라인명 헤더 */}
              {filteredFactoryLines.map((line) => {
                const targetShift = line.shifts?.find((shift: any) => shift.type === viewType)
                const status = targetShift?.status || 'NORMAL'

                return (
                  <div key={line.id} className="flex flex-col bg-slate-200 border-white min-w-0">
                    {/* 라인명 */}
                    <div className="flex-1 flex items-center justify-center border-b-1 border-white px-2 py-2 min-h-0">
                      <span
                        className="font-bold text-center break-words leading-tight w-full"
                        style={{
                          fontSize: 'clamp(0.75rem, 1.2vw, 1.25rem)',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {line.name}
                      </span>
                    </div>

                    {/* 라인 상태 */}
                    <div
                      className={`flex items-center justify-center px-1 ${colorWorkStatus(status)}`}
                      style={{
                        minHeight: 'clamp(30px, 3vh, 50px)',
                      }}
                    >
                      <span
                        className="font-semibold text-center leading-tight"
                        style={{
                          fontSize: 'clamp(0.65rem, 1.2vw, 1rem)',
                          wordBreak: 'keep-all',
                        }}
                      >
                        {displayWorkStatus(status)}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* 공정별 행 */}
              {Array.from({ length: factoryConfigData! }, (_, processIndex) => (
                <React.Fragment key={`process-${processIndex}`}>
                  {/* 좌측 공정명 */}
                  <div className="flex items-center justify-center bg-slate-100 border-r-1 border-b border-gray-200">
                    <span
                      className="font-bold text-black"
                      style={{ fontSize: 'clamp(1rem, 1.1vw, 1.5rem)' }}
                    >
                      P{processIndex + 1}
                    </span>
                  </div>

                  {/* 각 라인별 공정 셀 */}
                  {filteredFactoryLines.map((line, lineIndex) => {
                    const targetShift = line.shifts?.find((shift: any) => shift.type === viewType)
                    const slot = targetShift?.slots?.[processIndex]

                    return (
                      <div
                        key={`${line.id}-p${processIndex}`}
                        className={`flex items-center justify-center bg-white border-b border-gray-200 min-w-0 overflow-hidden ${
                          lineIndex < filteredFactoryLines.length - 1 ? 'border-r' : ''
                        }`}
                      >
                        {slot ? (
                          <AreaWaitingWorker slot={slot} />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        <header
          className={`w-full h-24 bg-white border-t flex justify-between items-center px-6 ${!isFullscreen && 'fixed left-0 bottom-0'}`}
        >
          <Image
            src="/logo.png"
            alt="SL미러텍 로고"
            width={150}
            height={80}
            className="object-contain"
          />
          <div className="flex items-center gap-4">
            {/* 반 스위치 */}
            <div className="flex bg-gray-200 rounded-full p-1">
              {classesData?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setViewClassId(item.id)}
                  className={`px-5 py-2 rounded-full text-2xl font-semibold transition-all ${
                    viewClassId === item.id
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {item.name}반
                </button>
              ))}
            </div>

            <div>
              {/* 야간/주간 스위치 */}
              <div className="flex bg-gray-200 rounded-full p-1 mr-6">
                <button
                  onClick={() => setViewType('DAY')}
                  className={`px-4 py-2 rounded-full text-2xl font-semibold transition-all ${
                    viewType === 'DAY'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  주간
                </button>
                <button
                  onClick={() => setViewType('NIGHT')}
                  className={`px-4 py-2 rounded-full text-2xl font-semibold transition-all ${
                    viewType === 'NIGHT'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  야간
                </button>
              </div>
            </div>
            <button
              onClick={toggleFullScreen}
              className="flex items-center gap-2 px-4 py-2.5 text-2xl bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              {isFullscreen ? '전체화면 해제' : '전체화면'}
            </button>
          </div>
        </header>
      </main>
    </>
  )
}

export default MonitorPage
