'use client'

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLineWithProcess } from '@/lib/api/line-with-process-api'
import Image from 'next/image'
import { Maximize, Minimize } from 'lucide-react'
import { colorWorkStatus, displayWorkStatus } from '@/lib/utils/shift-status'
import { ShiftType } from '@prisma/client'

const MonitorPage = () => {
  const [isActive, setIsActive] = useState(false)
  const [viewType, setViewType] = useState<ShiftType>('DAY')
  const [viewClassNo, setViewClassNo] = useState<number>(1)

  const [maxLength, setMaxLength] = useState<number>(0)
  const { data } = useQuery({
    queryKey: ['monitor', viewClassNo],
    queryFn: getLineWithProcess,
    select: (response) => {
      return response.data.filter((item) => item.classNo === viewClassNo)
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
          <div className="flex items-center gap-4">
            {/* 1반/2반 스위치 */}
            <div className="flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setViewClassNo(1)}
                className={`px-5 py-1 rounded-full text-lg font-semibold transition-all ${
                  viewClassNo === 1
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                1반
              </button>
              <button
                onClick={() => setViewClassNo(2)}
                className={`px-5 py-1 rounded-full text-lg font-semibold transition-all ${
                  viewClassNo === 2
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                2반
              </button>
            </div>

            {/* 야간/주간 스위치 */}
            <div className="flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setViewType('DAY')}
                className={`px-4 py-1 rounded-full text-lg font-semibold transition-all ${
                  viewType === 'DAY'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                주간
              </button>
              <button
                onClick={() => setViewType('NIGHT')}
                className={`px-4 py-1 rounded-full text-lg font-semibold transition-all ${
                  viewType === 'NIGHT'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                야간
              </button>
            </div>
          </div>
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
                gridTemplateColumns: `300px repeat(${maxLength}, 1fr)`,
                height: `calc(100vh / ${data.length})`,
              }}
            >
              {/* 라인명 */}
              <div className="flex bg-slate-200 border-white">
                <div className="flex-1 flex gap-2 items-center justify-center font-bold text-3xl border-b-2 border-white px-2 text-center min-w-0">
                  <span className="break-all overflow-wrap-anywhere leading-none">{line.name}</span>
                </div>
                <div
                  className={`w-[60px] px-2 ${colorWorkStatus(viewType === 'DAY' ? line.dayStatus : line.nightStatus)} border flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-2xl">
                    {displayWorkStatus(viewType === 'DAY' ? line.dayStatus : line.nightStatus)}
                  </span>
                </div>
              </div>

              {/* 공정 칸 */}
              {Array.from({ length: maxLength }, (_, index) => {
                const proc = line.processes[index]
                const targetShift = proc?.shifts.filter((item) => item.type === viewType)[0]

                console.log(proc, proc?.name)

                return (
                  <div key={'process' + index} className="flex">
                    {proc && targetShift ? (
                      <div className="flex flex-1 justify-between">
                        {/* 공정 이름 */}
                        <div className="w-[90px] flex justify-center items-center bg-slate-100 border-b-2 border-gray-200 text-center">
                          <span className="text-2xl font-bold text-black">{proc.name}</span>
                        </div>
                        <div className="flex-grow-1 flex flex-col justify-center items-center border-b-2 border-gray-200">
                          <div className="w-full flex-1 flex flex-col justify-center items-center border-gray-200 bg-white">
                            {/* 대기자 */}
                            {targetShift.waitingWorker ? (
                              <div className="flex items-center gap-4">
                                {/* 활성화 된 사용자 */}
                                {isActive && (
                                  <>
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                    </span>
                                  </>
                                )}

                                <div>
                                  <p className="text-3xl font-semibold text-black leading-none">
                                    {targetShift.waitingWorker.name}
                                  </p>
                                  <span className="text-lg font-normal text-gray-500 leading-none">
                                    ({targetShift.waitingWorker.userId})
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <>-</>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex justify-center items-center border-b border-gray-200"></div>
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
