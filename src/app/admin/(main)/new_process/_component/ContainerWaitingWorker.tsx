import React from 'react'
import { ProcessResponseDto } from '@/types/line-with-process'
import { leftTableShiftHead } from '@/app/admin/(main)/new_process/_component/SettingProcess'
import { ShiftType } from '@prisma/client'
import CardWaitingWorker from '@/app/admin/(main)/new_process/_component/CardWaitingWorker'

const ContainerWaitingWorker = ({
  process,
  shiftType = 'DAY',
  onDragStart,
  onDrop,
  onDragOver,
  isDragging,
  dragState,
}: {
  process: ProcessResponseDto
  shiftType: ShiftType
  onDragStart?: (e: React.DragEvent, processId: string, shiftType: ShiftType) => void
  onDrop?: (e: React.DragEvent, processId: string, shiftType: ShiftType) => void
  onDragOver?: (e: React.DragEvent) => void
  isDragging?: boolean
  dragState?: any
}) => {
  const shift = process.shifts.filter(({ type }) => type === shiftType)?.[0]
  const waitingWorker = shift?.waitingWorker

  // 현재 셀이 드래그 중인지 확인
  const isCurrentlyDragged = isDragging && 
    dragState?.draggedType === 'worker' && 
    dragState?.draggedItem?.processId === process.id && 
    dragState?.draggedItem?.shiftType === shiftType

  // 드롭 가능한 영역인지 확인
  const isDroppable = isDragging && 
    dragState?.draggedType === 'worker' && 
    !isCurrentlyDragged

  // 동적 스타일 클래스
  const getContainerClass = () => {
    let baseClass = "rounded-sm flex h-full items-center justify-center gap-1 cursor-move transition-all duration-200"
    
    if (isCurrentlyDragged) {
      return `${baseClass} bg-blue-100 border-2 border-blue-400 opacity-50 scale-95`
    } else if (isDroppable) {
      return `${baseClass} bg-green-50 border-2 border-green-300 hover:bg-green-100`
    } else {
      return `${baseClass} bg-gray-50 border border-gray-200 hover:bg-gray-100`
    }
  }

  return (
    <div key={process.id} className={`${leftTableShiftHead} px-2 py-1`}>
      <div 
        className={getContainerClass()}
        draggable
        onDragStart={(e) => onDragStart?.(e, process.id, shiftType)}
        onDrop={(e) => onDrop?.(e, process.id, shiftType)}
        onDragOver={onDragOver}
      >
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
