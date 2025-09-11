import React from 'react'
import { ProcessResponseDto } from '@/types/line-with-process'
import { leftTableShiftHead } from '@/app/admin/(main)/new_process/_component/SettingProcess'
import { ShiftType } from '@prisma/client'
import CardWaitingWorker from '@/app/admin/(main)/new_process/_component/CardWaitingWorker'

const ContainerWaitingWorker = ({
  process,
  shiftType = 'DAY',
}: {
  process: ProcessResponseDto
  shiftType: ShiftType
}) => {
  const waitingWorker = process.shifts.filter(({ type }) => type === shiftType)?.[0]?.waitingWorker

  return (
    <div key={process.id} className={`${leftTableShiftHead} px-2 py-1`}>
      <div className="bg-gray-50 border border-gray-200 rounded-sm flex h-full items-center justify-center gap-1 cursor-move">
        {waitingWorker ? (
          // 대기 등록 된 작업자
          <CardWaitingWorker waitingWorker={waitingWorker} />
        ) : (
          // 등록이 안된 칸
          <span className="flex items-center justify-center gap-1 text-sm text-gray-400">대기</span>
        )}
      </div>
    </div>
  )
}

export default ContainerWaitingWorker
