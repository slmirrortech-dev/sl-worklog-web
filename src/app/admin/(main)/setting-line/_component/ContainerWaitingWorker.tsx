import React, { useEffect, useState } from 'react'
import { LineResponseDto, ProcessResponseDto } from '@/types/line-with-process'
import { leftTableShiftHead } from '@/app/admin/(main)/setting-line/_component/SettingProcess'
import { ShiftType } from '@prisma/client'
import CardWaitingWorker from '@/app/admin/(main)/setting-line/_component/CardWaitingWorker'
import { Plus, User, Clock, MapPin, Settings } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import PopoverContentAdd from '@/app/admin/(main)/setting-line/_component/PopoverContentAdd'
import { ApiResponse } from '@/types/common'
import { deleteWaitingWorKerApi } from '@/lib/api/wating-worker-api'
import useActiveWorkLog from '@/hooks/useActiveWorkLog'

const ContainerWaitingWorker = ({
  isEditMode,
  isLocked,
  process,
  shiftType = 'DAY',
  setLineWithProcess,
  onDragStart,
  onDrop,
  onDragOver,
  onDragEnd,
  isDragging,
  dragState,
}: {
  isEditMode: boolean
  isLocked: boolean
  process: ProcessResponseDto
  shiftType: ShiftType
  setLineWithProcess: any
  onDragStart?: (e: React.DragEvent, processId: string, shiftType: ShiftType) => void
  onDrop?: (e: React.DragEvent, processId: string, shiftType: ShiftType) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  isDragging?: boolean
  dragState?: any
}) => {
  const shift = process.shifts.filter(({ type }) => type === shiftType)?.[0]
  const waitingWorker = shift?.waitingWorker
  const processShiftId = shift?.id || ''

  // 실시간 작업 활성 상태 확인
  const { isActive, startedAt } = useActiveWorkLog(processShiftId, waitingWorker?.id)


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
      'rounded-lg border shadow-sm flex h-full items-center justify-center gap-2 transition-all duration-300 min-h-[80px]'

    // 시프트 타입에 따른 기본 배경색 설정
    const shiftBgColor = shiftType === 'DAY' ? 'bg-gray-50' : 'bg-gray-100'
    const shiftHoverColor = shiftType === 'DAY' ? 'hover:bg-gray-100' : 'hover:bg-gray-200'

    // 작업 시작 여부에 따라 배경색 설정
    const waitingBgColor = isActive ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-200'

    // 드래그 상태별 스타일
    if (isCurrentlyDragged) {
      return `${baseClass} bg-gray-200 border-gray-400 opacity-70 scale-95`
    } else if (isDroppable) {
      return `${baseClass} ${shiftBgColor} border-gray-300 ${!isEditMode && shiftHoverColor} ${!isEditMode && 'hover:shadow-md'}`
    } else if (waitingWorker) {
      return `${baseClass} ${waitingBgColor} ${!isEditMode && 'hover:bg-gray-50 hover:shadow-md'}`
    } else {
      return `${baseClass} ${shiftBgColor} border-gray-200 ${!isEditMode && shiftHoverColor} border-dashed`
    }
  }

  const [isOpenInfo, setIsOpenInfo] = useState(false)
  const [isOpenNoInfo, setIsOpenNoInfo] = useState(false)

  useEffect(() => {
    if (isLocked || isEditMode) {
      setIsOpenInfo(false)
      setIsOpenInfo(false)
    }
  }, [isLocked, isEditMode])

  return (
    <div key={process.id} className={`${leftTableShiftHead} px-2 py-1`}>
      <div
        className={
          getContainerClass() +
          ' ' +
          `${isEditMode ? 'pointer-events-none !cursor-not-allowed opacity-50' : '!cursor-move'}`
        }
        draggable={!!waitingWorker && !isEditMode}
        onDragStart={(e) => onDragStart?.(e, process.id, shiftType)}
        onDrop={(e) => onDrop?.(e, process.id, shiftType)}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        {waitingWorker ? (
          <Popover open={isOpenInfo} onOpenChange={setIsOpenInfo}>
            <PopoverTrigger className={`${isEditMode ? '!cursor-not-allowed' : 'cursor-pointer'}`}>
              <div className={`w-full h-full flex items-center justify-center`}>
                <CardWaitingWorker
                  waitingWorker={waitingWorker}
                  isActive={isActive}
                  startedAt={startedAt}
                />
              </div>
            </PopoverTrigger>
            {!isLocked && !isEditMode && isOpenInfo && (
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="text-center border-b pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{waitingWorker.name}</h3>
                    <p className="text-sm text-gray-600">작업자 정보</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">사번</p>
                        <p className="text-sm text-gray-600">{waitingWorker.userId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">현재 위치</p>
                        <p className="text-sm text-gray-600">
                          {process.name} ({shiftType === 'DAY' ? '주간' : '야간'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">근무 시간</p>
                        <p className="text-sm text-gray-600">14시간 36분</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <button
                      disabled={isEditMode}
                      onClick={async () => {
                        try {
                          const {
                            data,
                          }: ApiResponse<{
                            deleted: any
                            updated: LineResponseDto[]
                          }> = await deleteWaitingWorKerApi(process.id, shiftType)
                          setLineWithProcess(data.updated)
                        } catch (error) {
                          alert('선택한 작업자 대기열에서 삭제 오류')
                        }
                      }}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors`}
                    >
                      <Settings className="w-4 h-4" />
                      작업자 대기열에서 제외
                    </button>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>
        ) : (
          // 등록이 안된 칸
          <Popover open={isOpenNoInfo} onOpenChange={setIsOpenNoInfo}>
            <PopoverTrigger
              asChild
              disabled={isEditMode}
              className={`${isEditMode ? '!cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">대기</span>
              </div>
            </PopoverTrigger>
            {!isLocked && !isEditMode && isOpenNoInfo && (
              <PopoverContentAdd
                setLineWithProcess={setLineWithProcess}
                setIsOpen={setIsOpenNoInfo}
                process={process}
                shiftType={shiftType}
              />
            )}
          </Popover>
        )}
      </div>
    </div>
  )
}

export default ContainerWaitingWorker
