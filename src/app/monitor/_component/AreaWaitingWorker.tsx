import React, { useState } from 'react'
import { waitingWorkerModel } from '@/types/line-with-process'
import useActiveWorkLog from '@/hooks/useActiveWorkLog'
import { useQuery } from '@tanstack/react-query'
import { getLicenseApi } from '@/lib/api/user-api'
import { X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

const AreaWaitingWorker = ({
  processShiftId,
  waitingWorker,
}: {
  processShiftId: string
  waitingWorker: waitingWorkerModel | null
}) => {
  // 실시간 작업 활성 상태 확인
  const { isActive } = useActiveWorkLog(processShiftId, waitingWorker?.id)
  const [isShowLicense, setIsShowLicense] = useState(false)
  const { showToast } = useToast()

  const { data: licenseData } = useQuery({
    queryKey: ['license', waitingWorker?.licensePhotoUrl],
    queryFn: () => getLicenseApi(waitingWorker!.licensePhotoUrl!),
    enabled: !!waitingWorker?.licensePhotoUrl,
    select: (response) => {
      if (response && response.data?.url) {
        return response.data.url
      } else {
        return null
      }
    },
  })

  return (
    <>
      {waitingWorker ? (
        <button
          className="flex-1 w-full  flex items-center justify-center gap-4"
          onClick={() => {
            if (waitingWorker.licensePhotoUrl) {
              setIsShowLicense(!isShowLicense)
            } else {
              showToast(`${waitingWorker.name}님의 등록된 면허증이 없습니다.`)
            }
          }}
        >
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
        </button>
      ) : (
        <></>
      )}
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
              <h3 className="text-lg font-semibold text-gray-900">
                {waitingWorker?.name}님의 공정면허증
              </h3>
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
                alt={waitingWorker?.name + '의 공정면허증'}
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
