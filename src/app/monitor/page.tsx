'use client'

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
import { useLoading } from '@/contexts/LoadingContext'
import { useFactoryLineRealtime } from '@/hooks/useAllFactoryLineRealtime'
import NoData from '@/app/monitor/_component/Nodata'

const MonitorPage = () => {
  useFactoryLineRealtime()
  const { showLoading, hideLoading } = useLoading()
  const [viewType, setViewType] = useState<ShiftType>('DAY')
  const [viewClassId, setViewClassId] = useState<string>('')
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
      <main className="w-screen h-screen bg-white overflow-hidden flex flex-col">
        {/* 그리드 영역 */}
        <div className="flex-1 overflow-hidden">
          {isPendingClasses ||
          isPendingAllFactoryLineData ||
          isPendingFactoryConfig ? null : filteredFactoryLines.length === 0 ||
            !factoryConfigData ? (
            <NoData
              name={
                classesData?.find((item) => item.id === viewClassId)?.name
                  ? `${classesData.find((item) => item.id === viewClassId)?.name}반`
                  : ''
              }
            />
          ) : (
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
                    <div className="flex-1 flex items-center justify-center border-r-1 border-white px-2 py-2 min-h-0">
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
        </div>

        {/* 하단 고정 헤더 */}
        <header
          className="w-full bg-white border-t flex justify-between items-center flex-shrink-0"
          style={{
            padding: 'clamp(0.375rem, 1vh, 1rem) clamp(0.5rem, 1.5vw, 1.5rem)',
          }}
        >
          <div className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="SL미러텍 로고"
              width={150}
              height={80}
              className="object-contain"
              style={{
                width: 'clamp(60px, 8vw, 120px)',
                height: 'auto',
                maxHeight: 'clamp(30px, 5vh, 60px)',
              }}
            />
          </div>
          <div className="flex items-center" style={{ gap: 'clamp(0.375rem, 0.8vw, 0.75rem)' }}>
            {/* 반 스위치 */}
            <div
              className="flex bg-gray-200 rounded-full"
              style={{ padding: 'clamp(0.125rem, 0.25vh, 0.2rem)' }}
            >
              {classesData?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setViewClassId(item.id)}
                  className={`rounded-full font-semibold transition-all ${
                    viewClassId === item.id
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{
                    padding: 'clamp(0.25rem, 0.6vh, 0.5rem) clamp(0.5rem, 1.5vw, 1rem)',
                    fontSize: 'clamp(0.7rem, 1.2vw, 1.1rem)',
                  }}
                >
                  {item.name}반
                </button>
              ))}
            </div>

            {/* 야간/주간 스위치 */}
            <div
              className="flex bg-gray-200 rounded-full"
              style={{ padding: 'clamp(0.125rem, 0.25vh, 0.2rem)' }}
            >
              <button
                onClick={() => setViewType('DAY')}
                className={`rounded-full font-semibold transition-all ${
                  viewType === 'DAY'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  padding: 'clamp(0.25rem, 0.6vh, 0.5rem) clamp(0.5rem, 1.5vw, 1rem)',
                  fontSize: 'clamp(0.7rem, 1.2vw, 1.1rem)',
                }}
              >
                주간
              </button>
              <button
                onClick={() => setViewType('NIGHT')}
                className={`rounded-full font-semibold transition-all ${
                  viewType === 'NIGHT'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{
                  padding: 'clamp(0.25rem, 0.6vh, 0.5rem) clamp(0.5rem, 1.5vw, 1rem)',
                  fontSize: 'clamp(0.7rem, 1.2vw, 1.1rem)',
                }}
              >
                야간
              </button>
            </div>

            {/* 전체화면 버튼 */}
            <button
              onClick={toggleFullScreen}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
              style={{
                gap: 'clamp(0.25rem, 0.4vw, 0.4rem)',
                padding: 'clamp(0.25rem, 0.6vh, 0.5rem) clamp(0.5rem, 1.5vw, 1rem)',
                fontSize: 'clamp(0.7rem, 1.2vw, 1.1rem)',
              }}
            >
              {isFullscreen ? (
                <Minimize
                  style={{ width: 'clamp(14px, 1.2vw, 20px)', height: 'clamp(14px, 1.2vw, 20px)' }}
                />
              ) : (
                <Maximize
                  style={{ width: 'clamp(14px, 1.2vw, 20px)', height: 'clamp(14px, 1.2vw, 20px)' }}
                />
              )}
              <span>{isFullscreen ? '전체화면 해제' : '전체화면'}</span>
            </button>
          </div>
        </header>
      </main>
    </>
  )
}

export default MonitorPage
