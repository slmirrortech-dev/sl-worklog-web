'use client'

import React, { useState } from 'react'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { Plus, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import CustomConfirmDialog from '@/components/CustomConfirmDialog'

const CLASS_MOCK = [
  { id: 1, name: '1', order: 1 },
  { id: 2, name: '2', order: 2 },
  { id: 3, name: '서브', order: 3 },
]

const LINE_MOCK = [
  {
    id: 'uuid', // 라인 고유 아이디
    name: 'MV L/R', // 라인 명
    displayOrder: 1, // 라인 순서
    class: {
      id: 'uuid',
      name: '1',
    }, // 반
    shifts: [
      {
        id: 'uuid',
        type: 'DAY',
        status: 'NORMAL',
        processes: [
          {
            id: 'uuid',
            name: 'P1',
            slotIndex: 1,
            worker: {
              id: '970382',
              name: '최승혁',
              status: 'NORMAL', // 초록색
            },
          },
          {
            id: 'uuid',
            name: 'P2',
            slotIndex: 2,
            worker: null,
          },
        ],
      },
      {
        id: 'uuid',
        type: 'NIGHT',
        status: 'NORMAL',
        processes: [
          {
            id: 'uuid',
            name: 'P1',
            worker: {
              id: 'uuid',
              name: '작업자',
              status: 'NORMAL',
            },
          },
        ],
      },
    ],
  },
]

const WorkPlacePage = () => {
  const router = useRouter()

  const [selectedClass, setSelectedClass] = useState(CLASS_MOCK[0].name)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const handleSettingClick = () => {
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmNavigate = () => {
    setIsConfirmDialogOpen(false)
    router.push(ROUTES.ADMIN.WORKPLACE_SETTING)
  }

  // 공정 개수 (동적으로 변경 가능)
  const processCount = 7
  const totalColumns = 2 + processCount // 라인명 + 상태 + 공정들

  return (
    <div className="pb-8">
      {/* 해더 아래 고정 영역 */}
      <div className="sticky bg-gray-50 top-16 z-40 pt-6 -mt-6">
        <section className="flex justify-between items-center">
          {/* 반 선택 영역 */}
          <div className="flex bg-gray-200 rounded-full p-1 w-fit">
            {CLASS_MOCK.map((classItem) => (
              <button
                key={classItem.name}
                onClick={() => setSelectedClass(classItem.name)}
                className={`px-6 py-2 rounded-full text-lg font-semibold transition-all ${
                  selectedClass === classItem.name
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
      <section
        className="grid bg-white"
        style={{ gridTemplateColumns: `repeat(${totalColumns}, 1fr)` }}
      >
        <div className="flex items-center justify-center text-lg font-bold whitespace-nowrap">
          라인A
        </div>
        <div className="flex flex-col">
          <div className="flex-1 bg-gray-50 gap-3 flex items-center justify-center text-base font-semibold whitespace-nowrap">
            <div>주간</div>
            <div>
              <ShiftStatusLabel status={'NORMAL'} size={'lg'} />
            </div>
          </div>
          <div className="flex-1 bg-gray-100 gap-3 flex items-center justify-center text-base font-semibold whitespace-nowrap">
            <div>야간</div>
            <div>
              <ShiftStatusLabel status={'NORMAL'} size={'lg'} />
            </div>
          </div>
        </div>
        {Array.from(Array(processCount).keys()).map((index) => (
          <div key={index} className="flex flex-col h-50">
            <div className="flex-1 bg-gray-50 gap-4 px-1 py-2 flex items-center justify-center">
              <div className="w-full rounded-lg border shadow-sm text-gray-400 flex flex-col h-full items-center justify-center gap-2 transition-all duration-300 border-gray-200 hover:bg-gray-100 border-dashed !cursor-move">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">대기</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 gap-4 px-1 py-2 flex items-center justify-center">
              <div className="w-full rounded-lg border shadow-sm h-full flex flex-col items-center justify-center transition-all duration-300 bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md !cursor-move">
                <p className="flex items-center justify-center gap-1 text-base font-medium">
                  <span className="relative flex h-2.5 w-2.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  최승혁
                </p>
                <span className={`text-sm text-gray-600`}>사번 : 970382</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <CustomConfirmDialog
        isOpen={isConfirmDialogOpen}
        setIsOpen={setIsConfirmDialogOpen}
        isLoading={false}
        title="작업장 설정"
        desc={`설정창에 진입하면 다른 관리자의 작업장 현황 페이지 사용이 일시 중지됩니다.
계속하시겠습니까?`}
        btnCancel={{ btnText: '취소' }}
        btnConfirm={{ btnText: '확인', fn: handleConfirmNavigate }}
      />
    </div>
  )
}

export default WorkPlacePage
