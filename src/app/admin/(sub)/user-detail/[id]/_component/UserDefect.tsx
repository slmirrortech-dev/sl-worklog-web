'use client'

import React, { useState } from 'react'
import { OctagonAlert, Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createDefectLogApi,
  getDefectLogsByWorkerApi,
  removeDefectLogApi,
} from '@/lib/api/defect-log-api'
import { DefectLogCreateRequest } from '@/types/defect-log'
import { ShiftType } from '@prisma/client'
import { displayShiftType } from '@/lib/utils/shift-type'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useLoading } from '@/contexts/LoadingContext'
import { CustomDatePicker } from '@/components/CustomDatePicker'
import useDialogStore from '@/store/useDialogStore'

const UserDefect = ({ userId }: { userId: string }) => {
  const { showLoading, hideLoading } = useLoading()
  const { showDialog } = useDialogStore()

  const [isAdding, setIsAdding] = useState(false)

  // 입력 폼 상태
  const [newDate, setNewDate] = useState<Date | null>(new Date())
  const [newTime, setNewTime] = useState('')
  const [newLine, setNewLine] = useState('')
  const [newClass, setNewClass] = useState('1반') // 기본값 1반
  const [newShift, setNewShift] = useState<ShiftType>(ShiftType.DAY)
  const [newProcess, setNewProcess] = useState('')
  const [newMemo, setNewMemo] = useState('')

  const {
    data: defectData,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['getDefectLogsByWorkerApi', userId],
    queryFn: () => getDefectLogsByWorkerApi(userId),
    select: (response) => {
      return response.data || []
    },
  })

  const { mutate: removeMutate } = useMutation({
    mutationFn: removeDefectLogApi,
    onMutate: () => {
      showLoading()
    },
    onError: () => {
      showDialog({
        type: 'error',
        title: '삭제 실패',
        description: '불량유출 이력 삭제에 실패했습니다.',
        confirmText: '확인',
      })
    },
    onSuccess: () => {
      refetch()
    },
    onSettled: () => {
      hideLoading()
    },
  })

  const { mutate: addMutate } = useMutation({
    mutationFn: createDefectLogApi,
    onMutate: () => {
      showLoading()
    },
    onError: () => {
      showDialog({
        type: 'error',
        title: '추가 실패',
        description: '불량유출 이력 추가에 실패했습니다.',
        confirmText: '확인',
      })
    },
    onSuccess: () => {
      refetch() // 폼 초기화
      setNewDate(new Date())
      setNewLine('')
      setNewProcess('')
      setNewMemo('')
      setIsAdding(false)
    },
    onSettled: () => {
      hideLoading()
    },
  })

  const handleAdd = () => {
    if (!newDate || !newLine || !newClass || !newProcess || !newMemo) {
      showDialog({
        type: 'warning',
        title: '입력 필요',
        description: '모든 항목을 입력해주세요.',
        confirmText: '확인',
      })
      return
    }

    // Date 객체와 시간 문자열 결합 (KST 기준)
    const dateStr = format(newDate, 'yyyy-MM-dd')
    const timeStr = newTime || '00:00:00'
    // KST 시간대 포함 ISO 문자열 생성 후 UTC ISO String으로 변환
    const kstDateTime = new Date(`${dateStr}T${timeStr}+09:00`)

    const newRecord: DefectLogCreateRequest = {
      occurredAt: kstDateTime.toISOString(),
      workerId: userId,
      lineName: newLine,
      className: newClass,
      shiftType: newShift,
      processName: newProcess,
      memo: newMemo,
    }

    // api 호출
    addMutate(newRecord)
  }

  const handleDelete = (id: string) => {
    if (confirm('이 불량유출 이력을 삭제하시겠습니까?')) {
      removeMutate(id)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <OctagonAlert className="w-5 h-5 mr-2 text-gray-600" />
            불량유출 이력
          </h2>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              불량유출 이력 추가
            </Button>
          )}
        </div>
      </div>

      <div>
        {/* 불량유출 이력 추가 폼 */}
        {isAdding && (
          <div className="p-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">새 불량유출 이력 등록</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">발생일 *</label>
                  <CustomDatePicker
                    date={newDate}
                    onChangeAction={(e) => setNewDate(e)}
                    className="w-full !text-base h-10"
                    max={new Date()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">발생시간 *</label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full !text-base h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">라인 *</label>
                  <Input
                    type="text"
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                    placeholder="예: MX5 LH"
                    className="w-full !text-base h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">반 이름 *</label>
                  <Input
                    type="text"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="예: 1반, 2반, 서브반"
                    className="w-full !text-base h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">교대조</label>
                  <RadioGroup
                    value={newShift}
                    onValueChange={(e) => {
                      setNewShift(e as ShiftType)
                    }}
                    className="flex gap-4 h-10"
                  >
                    {Object.values(ShiftType).map((item: ShiftType) => {
                      return (
                        <div className="flex items-center space-x-1.5" key={item}>
                          <RadioGroupItem value={item} id={item} />
                          <Label
                            htmlFor={item}
                            className="text-base font-medium cursor-pointer flex items-center gap-1.5"
                          >
                            {displayShiftType(item)}
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">공정 *</label>
                  <Input
                    type="text"
                    value={newProcess}
                    onChange={(e) => setNewProcess(e.target.value)}
                    placeholder="예: P1"
                    className="w-full !text-base h-10"
                  />
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">메모 *</label>
                  <Input
                    type="text"
                    value={newMemo}
                    onChange={(e) => setNewMemo(e.target.value)}
                    placeholder="예: 부품 누락"
                    className="w-full !text-base h-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    setNewDate(new Date())
                    setNewLine('')
                    setNewProcess('')
                    setNewMemo('')
                  }}
                >
                  취소
                </Button>
                <Button size="sm" onClick={handleAdd}>
                  등록
                </Button>
              </div>
            </div>
          </div>
        )}

        {isPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {defectData && defectData.length === 0 && (
          <div className="text-center py-12 text-gray-400">등록된 불량유출 이력이 없습니다</div>
        )}

        {defectData && defectData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-32 min-w-[128px]">
                    발생일
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24 min-w-[96px]">
                    발생시간
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-28 min-w-[112px]">
                    라인
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20 min-w-[80px]">
                    교대조
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20 min-w-[80px]">
                    공정
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[200px]">
                    메모
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-16 min-w-[64px]">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {defectData?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-base text-gray-900 text-center whitespace-nowrap">
                      {format(item.occurredAt, 'yyyy-MM-dd')}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-900 text-center whitespace-nowrap">
                      {format(item.occurredAt, 'HH:mm')}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-900 text-center whitespace-nowrap">
                      {item.lineName}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-900 text-center whitespace-nowrap">
                      {displayShiftType(item.shiftType)}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-900 text-center whitespace-nowrap">
                      {item.processName}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-600 text-center whitespace-nowrap">
                      {item.memo}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDefect
