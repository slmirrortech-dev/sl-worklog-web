import React, { useState } from 'react'
import { WorkerStatus } from '@prisma/client'
import { useToast } from '@/contexts/ToastContext'
import { useQuery } from '@tanstack/react-query'
import { getLicenseApi } from '@/lib/api/user-api'
import { X } from 'lucide-react'

interface SlotWorker {
  id: string
  userId: string
  name: string
  licensePhotoUrl: string | null
}

interface ProcessSlot {
  id: string
  name: string
  slotIndex: number
  workerId: string | null
  worker: SlotWorker | null
  workerStatus: WorkerStatus
}

interface AreaWaitingWorkerProps {
  slot: ProcessSlot
}

const AreaWaitingWorker = ({ slot }: AreaWaitingWorkerProps) => {
  const { worker, workerStatus } = slot
  const [isShowLicense, setIsShowLicense] = useState(false)
  const { showToast } = useToast()

  // Hooks는 조건문 위에서 항상 호출되어야 함
  const { data: licenseData } = useQuery({
    queryKey: ['license', worker?.licensePhotoUrl],
    queryFn: () => getLicenseApi(worker!.licensePhotoUrl!),
    enabled: !!worker && !!worker.licensePhotoUrl,
    select: (response) => {
      if (response && response.data?.url) {
        return response.data.url
      } else {
        return null
      }
    },
  })

  if (!worker) {
    return <div className="w-full h-full" />
  }

  return (
    <>
      <div
        className="flex-1 w-full h-full flex flex-col items-center justify-center gap-1 p-2 min-w-0"
        onClick={() => {
          if (worker.licensePhotoUrl) {
            setIsShowLicense(!isShowLicense)
          } else {
            showToast(`${worker.name}님의 등록된 면허증이 없습니다.`)
          }
        }}
      >
        <p
          className="flex items-center justify-center gap-[0.2vw] font-semibold leading-tight text-center w-full"
          style={{
            fontSize: 'clamp(0.875rem, 1.2vw, 1.25rem)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          <span
            className="relative flex mr-1"
            style={{
              width: 'clamp(6px, 0.5vw, 10px)',
              height: 'clamp(6px, 0.5vw, 10px)',
            }}
          >
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                workerStatus === 'NORMAL'
                  ? 'bg-green-400'
                  : workerStatus === 'OVERTIME' && 'bg-yellow-400'
              } opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-full w-full ${
                workerStatus === 'NORMAL'
                  ? 'bg-green-500'
                  : workerStatus === 'OVERTIME' && 'bg-yellow-400'
              }`}
            ></span>
          </span>
          {worker.name}
        </p>
        <span
          className="font-normal text-gray-500 leading-tight text-center"
          style={{
            fontSize: 'clamp(0.75rem, 0.9vw, 1rem)',
            wordBreak: 'keep-all',
          }}
        >
          ({worker.userId})
        </span>
      </div>
      {isShowLicense && licenseData && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setIsShowLicense(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] min-h-[545px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{worker?.name}님의 공정면허증</h3>
              <button
                onClick={() => setIsShowLicense(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex items-center justify-center min-h-full w-full">
              <img
                src={licenseData}
                alt={worker?.name + '의 공정면허증'}
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AreaWaitingWorker
