'use client'

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLineWithProcess } from '@/lib/api/line-with-process-api'
import Image from 'next/image'
import { Maximize, Minimize } from 'lucide-react'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'

const MonitorPage = () => {
  const [maxLength, setMaxLength] = useState<number>(0)
  const { data } = useQuery({
    queryKey: ['monitor'],
    queryFn: getLineWithProcess,
    select: (response) => {
      return response.data.filter((item) => item.classNo === 1)
    },
  })

  useEffect(() => {
    if (data) {
      setMaxLength(Math.max(...data.flatMap((item) => item.processes.length)))
    }
  }, [data])

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
    <main>
      {!isFullscreen && (
        <header className="sticky z-2 top-0 left-0 right-0 h-16 bg-white border-b flex justify-between items-center px-6">
          <Image
            src="/logo.png"
            alt="SL미러텍 로고"
            width={100}
            height={40}
            className="object-contain"
          />
          <nav>
            <button>1반</button>
            <button>2반</button>
          </nav>
          <div>
            <button
              onClick={toggleFullScreen}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              {isFullscreen ? '전체화면 해제' : '전체화면'}
            </button>
          </div>
        </header>
      )}
      <div className="w-screen h-screen bg-white overflow-hidden">
        {data &&
          data.length > 0 &&
          data.map((line) => (
            <div
              key={line.id}
              className="grid"
              style={{
                gridTemplateColumns: `240px repeat(${maxLength}, 1fr)`,
                height: `calc(100vh / ${data.length})`,
              }}
            >
              {/* 라인명 */}
              <div className="flex bg-slate-200 border-b-2 border-white">
                <div className="flex-1 flex items-center justify-center font-bold text-lg border-r border-white px-2 text-center">
                  {line.name}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center border-b-2 border-gray-200 ">
                  <div className="w-full flex-1 flex gap-2 items-center justify-center border-gray-200 bg-white">
                    <span className="text-base font-semibold">주간</span>
                    <ShiftStatusLabel status={line.dayStatus} size={'sm'} />
                  </div>
                  <div className="w-full flex-1 flex gap-2 items-center justify-center bg-slate-100">
                    <span className="text-base font-semibold">야간</span>
                    <ShiftStatusLabel status={line.nightStatus} size={'sm'} />
                  </div>
                </div>
              </div>

              {/* 공정 칸 */}
              {Array.from({ length: maxLength }, (_, index) => {
                const proc = line.processes[index]
                return (
                  <div key={proc?.id || `empty-${line.id}-${index}`} className="flex text-xl">
                    {proc ? (
                      <div className="flex flex-1 justify-between">
                        <div className="flex-1 flex justify-center items-center bg-slate-100 border-b-2 border-gray-200">
                          <span className="text-lg font-semibold text-gray-700">{proc.name}</span>
                        </div>
                        <div className="flex-2 flex flex-col justify-center items-center border-b-2 border-gray-200">
                          <div className="w-full flex-1 flex justify-center items-center border-gray-200 bg-white">
                            {/* 주간 대기자 */}
                            <span className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                              <span className="text-base font-semibold text-black">
                                김영애 <span className="font-normal text-gray-500">(394823)</span>
                              </span>
                            </span>
                          </div>
                          <div className="w-full flex-1 flex justify-center items-center bg-slate-100">
                            {/* 야간 대기자 */}
                            <span className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                              <span className="text-base font-semibold text-black">
                                김영애 <span className="font-normal text-gray-500">(394823)</span>
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex justify-center items-center border-b border-gray-200">
                        <span className="text-gray-300">-</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
      </div>
    </main>
  )
}

export default MonitorPage
