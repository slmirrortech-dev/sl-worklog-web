'use client'

import React, { useEffect, useState } from 'react'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import CustomConfirmDialog from '@/components/CustomConfirmDialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAllFactoryLineApi,
  getFactoryConfigApi,
  getWorkClassesApi,
} from '@/lib/api/workplace-api'
import { WorkClassResponse } from '@/types/workplace'
import { useLoading } from '@/contexts/LoadingContext'
import ProcessSlotCard from './_component/ProcessSlotCard'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { addWorkerToSlotApi } from '@/lib/api/process-slot-api'

const WorkPlacePage = () => {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()
  const queryClient = useQueryClient()

  const { data: classesData, isPending: isPendingClasses } = useQuery({
    queryKey: ['getWorkClassesApi'],
    queryFn: getWorkClassesApi,
    select: (response) => response.data,
  })

  const { data: allFactoryLineData, isPending: isPendingAllFactoryLineData } = useQuery({
    queryKey: ['getAllFactoryLineApi'],
    queryFn: getAllFactoryLineApi,
    select: (response) => response.data,
  })

  const { data: factoryConfigData, isPending: isPendingFactoryConfig } = useQuery({
    queryKey: ['getFactoryConfigApi'],
    queryFn: getFactoryConfigApi,
    select: (response) => response.data,
  })

  const [classes, setClasses] = useState<WorkClassResponse[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [filteredLines, setFilteredLines] = useState<typeof allFactoryLineData>([])
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [activeWorker, setActiveWorker] = useState<{
    id: string
    name: string
    userId: string
    workerStatus: 'NORMAL' | 'OVERTIME' | null
  } | null>(null)

  // 드래그 앤 드롭을 위한 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px 이동 후 드래그 시작 (빠른 반응)
      },
    }),
  )

  useEffect(() => {
    if (classesData) {
      setClasses(classesData)
      setSelectedClassId(classesData[0].id)
    }
  }, [classesData])

  // 선택한 반에 맞게 라인 필터링
  useEffect(() => {
    if (allFactoryLineData && selectedClassId) {
      const filtered = allFactoryLineData.filter((line) => line.workClassId === selectedClassId)
      setFilteredLines(filtered)
    }
  }, [allFactoryLineData, selectedClassId])

  useEffect(() => {
    if (isPendingClasses || isPendingAllFactoryLineData || isPendingFactoryConfig) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isPendingClasses, isPendingAllFactoryLineData, isPendingFactoryConfig])

  // 작업자 이동
  const moveWorkerMutation = useMutation({
    mutationFn: async ({
      workerId,
      fromLineId,
      fromShiftType,
      fromSlotIndex,
      toLineId,
      toShiftType,
      toSlotIndex,
      toWorkerId,
    }: {
      workerId: string
      fromLineId: string
      fromShiftType: 'DAY' | 'NIGHT'
      fromSlotIndex: number
      toLineId: string
      toShiftType: 'DAY' | 'NIGHT'
      toSlotIndex: number
      toWorkerId: string | null
    }) => {
      if (toWorkerId) {
        // 스왑: 도착지 작업자를 출발지로 먼저 이동
        await addWorkerToSlotApi(fromLineId, fromShiftType, fromSlotIndex, toWorkerId, true)
        // 그 다음 출발지 작업자를 도착지로 이동
        await addWorkerToSlotApi(toLineId, toShiftType, toSlotIndex, workerId, true)
      } else {
        // 일반 이동: 새 위치에 배치 (force=true로 기존 위치에서 자동 제거)
        await addWorkerToSlotApi(toLineId, toShiftType, toSlotIndex, workerId, true)
      }
    },
    onMutate: async ({
      workerId,
      fromLineId,
      fromShiftType,
      fromSlotIndex,
      toLineId,
      toShiftType,
      toSlotIndex,
      toWorkerId,
    }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['getAllFactoryLineApi'] })

      // 현재 데이터 스냅샷 저장
      const previousData = queryClient.getQueryData(['getAllFactoryLineApi'])

      // Optimistic Update: 캐시를 즉시 업데이트
      queryClient.setQueryData(['getAllFactoryLineApi'], (old: any) => {
        if (!old?.data) return old

        const newData = JSON.parse(JSON.stringify(old.data)) // deep copy

        // 출발지 라인 찾기
        const fromLine = newData.find((line: any) => line.id === fromLineId)
        if (!fromLine) return old

        // 출발지 shift 찾기
        const fromShift = fromLine.shifts?.find((shift: any) => shift.type === fromShiftType)
        if (!fromShift) return old

        // 출발지 slot 찾기
        const fromSlot = fromShift.slots?.find((slot: any) => slot.slotIndex === fromSlotIndex)
        if (!fromSlot || !fromSlot.worker) return old

        // 출발지 작업자 정보 저장
        const fromWorker = fromSlot.worker
        const fromWorkerStatus = fromSlot.workerStatus

        // 도착지 라인 찾기
        const toLine = newData.find((line: any) => line.id === toLineId)
        if (!toLine) return old

        // 도착지 shift 찾기
        const toShift = toLine.shifts?.find((shift: any) => shift.type === toShiftType)
        if (!toShift) return old

        // 도착지 slot 찾기
        let toSlot = toShift.slots?.find((slot: any) => slot.slotIndex === toSlotIndex)

        if (toWorkerId && toSlot && toSlot.worker) {
          // 스왑: 두 작업자 위치 교환
          const toWorker = toSlot.worker
          const toWorkerStatus = toSlot.workerStatus

          // 출발지에 도착지 작업자 배치
          fromSlot.workerId = toWorkerId
          fromSlot.worker = toWorker
          fromSlot.workerStatus = toWorkerStatus

          // 도착지에 출발지 작업자 배치
          toSlot.workerId = workerId
          toSlot.worker = fromWorker
          toSlot.workerStatus = fromWorkerStatus
        } else {
          // 일반 이동
          // 출발지에서 작업자 제거
          fromSlot.workerId = null
          fromSlot.worker = null
          fromSlot.workerStatus = null

          // 도착지에 작업자 추가
          if (toSlot) {
            // 슬롯이 이미 존재하면 업데이트
            toSlot.workerId = workerId
            toSlot.worker = fromWorker
            toSlot.workerStatus = fromWorkerStatus
          } else {
            // 슬롯이 없으면 새로 생성
            if (!toShift.slots) toShift.slots = []
            toShift.slots.push({
              id: `temp_${Date.now()}`,
              name: `P${toSlotIndex + 1}`,
              slotIndex: toSlotIndex,
              shiftId: toShift.id,
              workerId: workerId,
              worker: fromWorker,
              workerStatus: fromWorkerStatus,
            })
          }
        }

        return { ...old, data: newData }
      })

      return { previousData }
    },
    onError: (error: Error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['getAllFactoryLineApi'], context.previousData)
      }
      alert(`작업자 이동 실패: ${error.message}`)
    },
    onSettled: () => {
      // 항상 refetch하여 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ['getAllFactoryLineApi'] })
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const workerId = active.id as string

    // active.data에서 작업자 정보 가져오기
    const workerData = active.data.current as {
      lineId: string
      shiftType: 'DAY' | 'NIGHT'
      slotIndex: number
      worker?: {
        id: string
        name: string
        userId: string
      }
      workerStatus?: 'NORMAL' | 'OVERTIME' | null
    }

    if (workerData?.worker) {
      setActiveWorker({
        id: workerId,
        name: workerData.worker.name,
        userId: workerData.worker.userId,
        workerStatus: workerData.workerStatus || null,
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveWorker(null)

    if (!over) return

    // active.id: "workerId"
    // over.id: "lineId-shiftType-slotIndex"
    const activeId = active.id as string
    const overId = over.id as string

    // active.data에서 출발지 정보 가져오기
    const fromData = active.data.current as {
      lineId: string
      shiftType: 'DAY' | 'NIGHT'
      slotIndex: number
    }

    // over.id 파싱 (형식: "lineId-shiftType-slotIndex")
    const [toLineId, toShiftType, toSlotIndexStr] = overId.split('-')
    const toSlotIndex = parseInt(toSlotIndexStr, 10)

    // 같은 위치면 무시
    if (
      fromData.lineId === toLineId &&
      fromData.shiftType === toShiftType &&
      fromData.slotIndex === toSlotIndex
    ) {
      return
    }

    // 도착지에 작업자가 있는지 확인
    const toLine = allFactoryLineData?.find((line) => line.id === toLineId)
    const toShift = toLine?.shifts?.find((shift) => shift.type === toShiftType)
    const toSlot = toShift?.slots?.find((slot) => slot.slotIndex === toSlotIndex)
    const toWorkerId = toSlot?.workerId

    // 작업자 이동 (스왑 여부 포함)
    moveWorkerMutation.mutate({
      workerId: activeId,
      fromLineId: fromData.lineId,
      fromShiftType: fromData.shiftType,
      fromSlotIndex: fromData.slotIndex,
      toLineId,
      toShiftType: toShiftType as 'DAY' | 'NIGHT',
      toSlotIndex,
      toWorkerId: toWorkerId || null, // 도착지에 작업자가 있으면 스왑
    })
  }

  const handleSettingClick = () => {
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmNavigate = () => {
    setIsConfirmDialogOpen(false)
    router.push(ROUTES.ADMIN.WORKPLACE_SETTING)
  }

  // 공정 개수 (동적으로 변경 가능)
  const processCount = factoryConfigData?.processCount ?? 7
  const totalColumns = 2 + processCount // 라인명 + 상태 + 공정들

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <>
        {/* 해더 아래 고정 영역 */}
        <section className="flex justify-between items-end">
          {/* 반 선택 영역 */}
          <div className="flex bg-gray-200 rounded-full p-1 w-fit">
            {classes.map((classItem) => (
              <button
                key={classItem.name}
                onClick={() => setSelectedClassId(classItem.id)}
                className={`px-4.5 py-1.5 rounded-full text-base font-semibold transition-all ${
                  selectedClassId === classItem.id
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {classItem.name}반
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={handleSettingClick}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4" />
              작업장 설정
            </button>
          </div>
        </section>
        <div className="overflow-x-auto overflow-y-hidden -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="min-w-fit px-4 sm:px-6 lg:px-8">
            {/* 테이블 해더 영역 */}
            <section
              className="grid bg-blue-500 rounded-lg rounded-b-none py-3 mt-4 text-base text-white shadow-sm"
              style={{
                gridTemplateColumns: `repeat(${totalColumns}, minmax(${1216 / 9}px, 1fr))`,
              }}
            >
              <div className="flex items-center justify-center whitespace-nowrap">공정명</div>
              <div className="flex items-center justify-center whitespace-nowrap">공정상태</div>
              {Array.from(Array(processCount).keys()).map((index) => (
                <div
                  key={index}
                  className="flex items-center justify-center font-bold whitespace-nowrap"
                >
                  P{index + 1}
                </div>
              ))}
            </section>
            <div className="overflow-y-auto h-[calc(100vh-280px)] lg:h-[calc(100vh-230px)]">
              {/* 라인 목록 렌더링 */}
              {filteredLines && filteredLines.length > 0 ? (
                filteredLines.map((line) => {
                  const dayShift = line.shifts?.find((shift) => shift.type === 'DAY')
                  const nightShift = line.shifts?.find((shift) => shift.type === 'NIGHT')

                  return (
                    <section
                      key={line.id}
                      className="grid bg-white"
                      style={{
                        gridTemplateColumns: `repeat(${totalColumns}, minmax(${1216 / 9}px, 1fr))`,
                      }}
                    >
                      {/* 라인명 */}
                      <div className="flex items-center justify-center text-lg font-bold whitespace-nowrap border-b border-gray-200">
                        {line.name}
                      </div>

                      {/* 상태 (주간/야간) */}
                      <div className="flex flex-col border-b border-gray-200">
                        <div className="flex-1 bg-gray-50 gap-3 flex items-center justify-center text-base font-semibold whitespace-nowrap">
                          <div>주간</div>
                          <div>
                            <ShiftStatusLabel status={dayShift?.status ?? 'NORMAL'} size={'lg'} />
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-100 gap-3 flex items-center justify-center text-base font-semibold whitespace-nowrap">
                          <div>야간</div>
                          <div>
                            <ShiftStatusLabel status={nightShift?.status ?? 'NORMAL'} size={'lg'} />
                          </div>
                        </div>
                      </div>

                      {/* 공정 슬롯 (P1, P2, ...) */}
                      {Array.from(Array(processCount).keys()).map((slotIndex) => {
                        const actualSlotIndex = slotIndex
                        const daySlot = dayShift?.slots?.find(
                          (s) => s.slotIndex === actualSlotIndex,
                        )
                        const nightSlot = nightShift?.slots?.find(
                          (s) => s.slotIndex === actualSlotIndex,
                        )

                        return (
                          <div
                            key={slotIndex}
                            className="flex flex-col h-50 border-b border-gray-200"
                          >
                            {/* 주간 슬롯 */}
                            <ProcessSlotCard
                              slot={daySlot}
                              shiftType="DAY"
                              lineId={line.id}
                              slotIndex={actualSlotIndex}
                            />

                            {/* 야간 슬롯 */}
                            <ProcessSlotCard
                              slot={nightSlot}
                              shiftType="NIGHT"
                              lineId={line.id}
                              slotIndex={actualSlotIndex}
                            />
                          </div>
                        )
                      })}
                    </section>
                  )
                })
              ) : (
                <div className="text-center py-18 text-gray-400">등록된 라인이 없습니다</div>
              )}
            </div>
          </div>
        </div>

        <CustomConfirmDialog
          isOpen={isConfirmDialogOpen}
          setIsOpen={setIsConfirmDialogOpen}
          isLoading={false}
          title="작업장 설정"
          desc={`설정창에 진입하면 다른 관리자의 작업장 현황 페이지 사용이 일시 중지됩니다.\n계속하시겠습니까?`}
          btnCancel={{ btnText: '취소' }}
          btnConfirm={{ btnText: '확인', fn: handleConfirmNavigate }}
        />
      </>

      <DragOverlay dropAnimation={null}>
        {activeWorker ? (
          <div className="w-40 rounded-lg border shadow-lg h-20 flex flex-col items-center justify-center bg-white border-gray-300 cursor-move">
            <p className="flex items-center justify-center gap-1 text-base font-medium">
              <span className="relative flex h-2.5 w-2.5 mr-1">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    activeWorker.workerStatus === 'NORMAL'
                      ? 'bg-green-400'
                      : activeWorker.workerStatus === 'OVERTIME'
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                  } opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    activeWorker.workerStatus === 'NORMAL'
                      ? 'bg-green-500'
                      : activeWorker.workerStatus === 'OVERTIME'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                ></span>
              </span>
              {activeWorker.name}
            </p>
            <span className="text-sm text-gray-600">사번 : {activeWorker.userId}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default WorkPlacePage
