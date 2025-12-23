'use client'

import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ProcessSlot } from '@/types/workplace'
import AddWorkerPopover from './AddWorkerPopover'
import CardLicense from '@/components/admin/CardLicense'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeWorkerFromSlotApi, updateWorkerStatusApi } from '@/lib/api/process-slot-api'
import { useLoading } from '@/contexts/LoadingContext'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import useDialogStore from '@/store/useDialogStore'

interface ProcessSlotCardProps {
  slot?: ProcessSlot
  shiftType: 'DAY' | 'NIGHT'
  lineId: string
  slotIndex: number
}

export default function ProcessSlotCard({
  slot,
  shiftType,
  lineId,
  slotIndex,
}: ProcessSlotCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showLoading, hideLoading } = useLoading()
  const { showDialog } = useDialogStore()

  const bgColor = shiftType === 'DAY' ? 'bg-gray-50' : 'bg-gray-100'

  // workerId가 있으면 작업자가 배치된 것으로 간주
  const hasWorker = slot?.workerId && slot?.worker

  // Droppable 설정 (모든 슬롯은 드롭 가능)
  const droppableId = `${lineId}-${shiftType}-${slotIndex}`
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: droppableId,
  })

  // Draggable 설정 (작업자가 있는 경우에만)
  const draggableId = hasWorker ? slot.workerId! : ''
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: draggableId,
    data: {
      lineId,
      shiftType,
      slotIndex,
      worker: slot?.worker,
      workerStatus: slot?.workerStatus,
    },
    disabled: !hasWorker, // 작업자가 없으면 드래그 비활성화
  })

  // 작업자 제거
  const removeWorkerMutation = useMutation({
    mutationFn: () => removeWorkerFromSlotApi(lineId, shiftType, slotIndex),
    onMutate: () => {
      showLoading()
    },
    onSuccess: () => {
      // 라인 데이터 refetch
      queryClient.invalidateQueries({ queryKey: ['getAllFactoryLineApi'] })
      setIsOpen(false)
    },
    onError: (error: Error) => {
      showDialog({
        type: 'error',
        title: '작업자 제거 실패',
        description: error.message,
        confirmText: '확인',
      })
    },
    onSettled: () => {
      hideLoading()
    },
  })

  // 작업자 상태 변경
  const updateStatusMutation = useMutation({
    mutationFn: (workerStatus: 'NORMAL' | 'OVERTIME') =>
      updateWorkerStatusApi(lineId, shiftType, slotIndex, workerStatus),
    onMutate: () => {
      showLoading()
    },
    onSuccess: () => {
      // 라인 데이터 refetch
      queryClient.invalidateQueries({ queryKey: ['getAllFactoryLineApi'] }).then(() => {
        hideLoading()
      })
    },
    onError: (error: Error) => {
      hideLoading()
      showDialog({
        type: 'error',
        title: '상태 변경 실패',
        description: error.message,
        confirmText: '확인',
      })
    },
  })

  const handleRemoveWorker = () => {
    showDialog({
      type: 'warning',
      title: '작업자 제외',
      description: '이 작업자를 제외하시겠습니까?',
      showCancel: true,
      cancelText: '취소',
      confirmText: '제외하기',
      onConfirm: () => {
        removeWorkerMutation.mutate()
      },
    })
  }

  const handleStatusChange = (value: string) => {
    updateStatusMutation.mutate(value as 'NORMAL' | 'OVERTIME')
  }

  return (
    <div
      ref={setDroppableRef}
      className={`flex-1 ${bgColor} gap-4 px-1 py-2 flex items-center justify-center transition-all duration-300 ${
        isOver ? 'shadow-md' : ''
      }`}
    >
      {hasWorker ? (
        // 작업자가 있을 때
        <Popover open={!isDragging && isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div
              ref={setDraggableRef}
              {...attributes}
              {...listeners}
              className={`w-full rounded-lg border shadow-sm h-full flex flex-col items-center justify-center bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-300 ${
                isDragging
                  ? 'opacity-70 scale-95 cursor-move bg-gray-200 border-gray-400'
                  : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              <p className="flex items-center justify-center gap-1 text-base font-medium">
                <span className="relative flex h-2.5 w-2.5 mr-1">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                      slot.workerStatus === 'NORMAL'
                        ? 'bg-green-400'
                        : slot.workerStatus === 'OVERTIME' && 'bg-yellow-400'
                    } opacity-75`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      slot.workerStatus === 'NORMAL'
                        ? 'bg-green-500'
                        : slot.workerStatus === 'OVERTIME' && 'bg-yellow-400'
                    }`}
                  ></span>
                </span>
                {slot.worker!.name}
              </p>
              <span className="text-sm text-gray-600">사번 : {slot.worker!.userId}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="border-b pb-3 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{slot.worker!.name}</h3>
                    <p className="text-sm text-gray-600">사번 : {slot.worker!.userId}</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* 작업자 상태 라디오 버튼 */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">작업 상태</Label>
                  <RadioGroup
                    value={slot.workerStatus}
                    onValueChange={handleStatusChange}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="NORMAL" id="normal" className="border-green-500" />
                      <Label
                        htmlFor="normal"
                        className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
                      >
                        정상
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem
                        value="OVERTIME"
                        id="overtime"
                        className="border-yellow-500"
                      />
                      <Label
                        htmlFor="overtime"
                        className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
                      >
                        잔업
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* 면허증 이미지 */}
              <CardLicense licensePhotoUrl={slot.worker!.licensePhotoUrl} />

              <div className="pt-3 border-t">
                <button
                  onClick={handleRemoveWorker}
                  disabled={removeWorkerMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removeWorkerMutation.isPending ? '제거 중...' : '제외하기'}
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        // 작업자가 없을 때 (대기 상태)
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div
              className={`w-full rounded-lg border shadow-sm text-gray-400 flex flex-col h-full items-center justify-center gap-2 transition-all duration-300 border-gray-200 border-dashed cursor-pointer ${
                isOver ? 'shadow-md hover:bg-gray-100' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">대기</span>
            </div>
          </PopoverTrigger>
          <AddWorkerPopover
            lineId={lineId}
            slotIndex={slotIndex}
            shiftType={shiftType}
            onClose={() => setIsOpen(false)}
          />
        </Popover>
      )}
    </div>
  )
}
