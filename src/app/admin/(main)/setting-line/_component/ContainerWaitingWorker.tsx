import React from 'react'
import { ProcessResponseDto } from '@/types/line-with-process'
import { leftTableShiftHead } from '@/app/admin/(main)/setting-line/_component/SettingProcess'
import { ShiftType } from '@prisma/client'
import CardWaitingWorker from '@/app/admin/(main)/setting-line/_component/CardWaitingWorker'
import { Plus } from 'lucide-react'

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
  const isCurrentlyDragged =
    isDragging &&
    dragState?.draggedType === 'worker' &&
    dragState?.draggedItem?.processId === process.id &&
    dragState?.draggedItem?.shiftType === shiftType

  // 드롭 가능한 영역인지 확인
  const isDroppable = isDragging && dragState?.draggedType === 'worker' && !isCurrentlyDragged

  // 동적 스타일 클래스
  const getContainerClass = () => {
    let baseClass =
      'rounded-lg border shadow-sm flex h-full items-center justify-center gap-2 cursor-move transition-all duration-300 min-h-[80px]'

    // 시프트 타입에 따른 기본 배경색 설정
    const shiftBgColor = shiftType === 'DAY' ? 'bg-gray-50' : 'bg-gray-100'
    const shiftHoverColor = shiftType === 'DAY' ? 'hover:bg-gray-100' : 'hover:bg-gray-200'

    if (isCurrentlyDragged) {
      return `${baseClass} bg-gray-200 border-gray-400 opacity-70 scale-95`
    } else if (isDroppable) {
      return `${baseClass} ${shiftBgColor} border-gray-300 ${shiftHoverColor} hover:shadow-md`
    } else if (waitingWorker) {
      return `${baseClass} bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md`
    } else {
      return `${baseClass} ${shiftBgColor} border-gray-200 ${shiftHoverColor} border-dashed`
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
          <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">대기</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContainerWaitingWorker
