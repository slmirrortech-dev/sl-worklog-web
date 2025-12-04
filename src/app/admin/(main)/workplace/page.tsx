'use client'

import React, { useEffect, useState } from 'react'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import CustomConfirmDialog from '@/components/CustomConfirmDialog'
import { useQuery } from '@tanstack/react-query'
import {
  getAllFactoryLineApi,
  getFactoryConfigApi,
  getWorkClassesApi,
} from '@/lib/api/workplace-api'
import { WorkClassResponse } from '@/types/workplace'
import { useLoading } from '@/contexts/LoadingContext'
import ProcessSlotCard from './_component/ProcessSlotCard'

const WorkPlacePage = () => {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()

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
    <div className="pb-8">
      {/* 해더 아래 고정 영역 */}
      <div className="sticky bg-gray-50 top-16 z-40 pt-6 -mt-6">
        <section className="flex justify-between items-center">
          {/* 반 선택 영역 */}
          <div className="flex bg-gray-200 rounded-full p-1 w-fit">
            {classes.map((classItem) => (
              <button
                key={classItem.name}
                onClick={() => setSelectedClassId(classItem.id)}
                className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
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

        {/* 테이블 해더 영역 */}
        <div
          className="grid bg-blue-500 rounded-lg rounded-b-none py-3 mt-4 text-base text-white shadow-sm"
          style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)` }}
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
        </div>
      </div>
      {/* 라인 목록 렌더링 */}
      {filteredLines && filteredLines.length > 0 ? (
        filteredLines.map((line) => {
          const dayShift = line.shifts?.find((shift) => shift.type === 'DAY')
          const nightShift = line.shifts?.find((shift) => shift.type === 'NIGHT')

          return (
            <section
              key={line.id}
              className="grid bg-white"
              style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)` }}
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
                const daySlot = dayShift?.slots?.find((s) => s.slotIndex === actualSlotIndex)
                const nightSlot = nightShift?.slots?.find((s) => s.slotIndex === actualSlotIndex)

                return (
                  <div key={slotIndex} className="flex flex-col h-50 border-b border-gray-200">
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

      <CustomConfirmDialog
        isOpen={isConfirmDialogOpen}
        setIsOpen={setIsConfirmDialogOpen}
        isLoading={false}
        title="작업장 설정"
        desc={`설정창에 진입하면 다른 관리자의 작업장 현황 페이지 사용이 일시 중지됩니다.\n계속하시겠습니까?`}
        btnCancel={{ btnText: '취소' }}
        btnConfirm={{ btnText: '확인', fn: handleConfirmNavigate }}
      />
    </div>
  )
}

export default WorkPlacePage
