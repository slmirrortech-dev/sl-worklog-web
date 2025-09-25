import React from 'react'
import { waitingWorkerModel } from '@/types/line-with-process'
import useActiveWorkLog from '@/hooks/useActiveWorkLog'

const AreaWaitingWorker = ({
  processShiftId,
  waitingWorker,
}: {
  processShiftId: string
  waitingWorker: waitingWorkerModel | null
}) => {
  // 실시간 작업 활성 상태 확인
  const { isActive } = useActiveWorkLog(processShiftId, waitingWorker?.id)

  return (
    <>
      {waitingWorker ? (
        <div className="flex items-center gap-4">
          {/* 활성화 된 사용자 */}

          <div className="w-3.5">
            {isActive && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
              </span>
            )}
          </div>

          <div>
            <p
              className={`text-3xl font-semibold leading-none ${isActive ? 'text-blue-500' : 'text-black'}`}
            >
              {waitingWorker.name}
            </p>
            <span className="text-lg font-normal text-gray-400 leading-none">
              ({waitingWorker.userId})
            </span>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

export default AreaWaitingWorker
