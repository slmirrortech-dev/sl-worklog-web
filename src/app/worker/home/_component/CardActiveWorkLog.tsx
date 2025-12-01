import React, { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import CustomConfirmDialog from '@/components/CustomConfirmDialog'
import { endWorkLogApi } from '@/lib/api/work-log-api'
import { useRouter } from 'next/navigation'

const CardActiveWorkLog = ({
  workLogId,
  lineName,
  classNo,
  processName,
  startAt,
}: {
  workLogId: string
  lineName: string
  classNo: string
  processName: string
  startAt: Date
}) => {
  const router = useRouter()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      <div className="space-y-1 rounded-xl bg-white px-6 py-6 mb-4 drop-shadow-md drop-shadow-gray-200">
        <div className="flex items-start justify-between flex-wrap">
          <p className="text-lg font-semibold whitespace-nowrap">라인</p>
          <div className="flex-grow-1 text-right">
            <p className="text-lg font-semibold text-primary-500">
              {lineName} <span className="font-normal text-gray-600">{classNo}반</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap">
          <p className="text-lg font-semibold whitespace-nowrap">공정</p>
          <span className="flex-grow-1 font-semibold text-lg text-gray-600 text-right">
            {processName}
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap">
          <p className="text-lg font-semibold whitespace-nowrap">시작 시간</p>
          <div className="flex flex-grow-1 items-center justify-end gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
            </span>
            <span className="text-lg text-gray-600 text-right">
              {format(startAt, 'MM-dd HH:mm', { locale: ko })}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setIsConfirmDialogOpen(true)
          }}
          type="button"
          className="mt-4 w-full border-1 botext-primary-500 text-primary-500 py-4 px-6 text-xl font-medium rounded-xl focus:outline-none transition-colors"
        >
          작업 종료하기
        </button>
      </div>
      <CustomConfirmDialog
        title="작업 종료 확인"
        desc="정말 작업을 종료하시겠습니까?"
        isOpen={isConfirmDialogOpen}
        setIsOpen={setIsConfirmDialogOpen}
        isLoading={isLoading}
        btnConfirm={{
          btnText: '종료하기',
          fn: async () => {
            setIsLoading(true)
            try {
              await endWorkLogApi({
                endedAt: new Date(),
                workLogId: workLogId,
              })
              router.refresh()
            } catch (error) {
            } finally {
              setIsLoading(false)
              setIsConfirmDialogOpen(false)
            }
          },
        }}
      />
    </>
  )
}

export default CardActiveWorkLog
