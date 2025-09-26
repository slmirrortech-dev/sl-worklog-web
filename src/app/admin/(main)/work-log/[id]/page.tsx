'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Edit, User, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { differenceInMinutes, format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { getWorkLogByIdApi } from '@/lib/api/work-log-api'
import ShiftTypeLabel from '@/components/admin/ShiftTypeLabel'
import { ShiftType, WorkStatus } from '@prisma/client'
import { displayWorkStatus } from '@/lib/utils/shift-status'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { displayShiftType } from '@/lib/utils/shift-type'
import DefectiveLabel from '@/components/admin/DefectiveLabel'
import { displayMinutes } from '@/lib/utils/time'

// 타입 정의
interface WorkLogDetail {
  id: string
  userId: string
  processId: string
  startedAt: Date
  endedAt: Date | null
  durationMinutes: number
  shiftType: 'DAY_NORMAL' | 'DAY_OVERTIME' | 'NIGHT_NORMAL' | 'NIGHT_OVERTIME' | 'UNKNOWN'
  isDefective: boolean
  memo: string
  user: {
    id: string
    name: string
    loginId: string
  }
  process: {
    id: string
    name: string
    line: {
      id: string
      name: string
    }
  }
}

interface WorkLogHistory {
  id: string
  field: string
  oldValue: string | null
  newValue: string | null
  changedBy: string
  changedAt: Date
  admin: {
    id: string
    name: string
    loginId: string
  }
}

// 근무형태 표시
const getShiftTypeInfo = (shiftType: string) => {
  switch (shiftType) {
    case 'DAY_NORMAL':
      return { label: '주간정상', color: 'bg-blue-100 text-blue-800' }
    case 'DAY_OVERTIME':
      return { label: '주간잔업', color: 'bg-blue-200 text-blue-900' }
    case 'NIGHT_NORMAL':
      return { label: '야간정상', color: 'bg-purple-100 text-purple-800' }
    case 'NIGHT_OVERTIME':
      return { label: '야간잔업', color: 'bg-purple-200 text-purple-900' }
    case 'UNKNOWN':
      return { label: '미분류', color: 'bg-gray-100 text-gray-800' }
    default:
      return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800' }
  }
}

// 필드명 한국어 변환
const getFieldLabel = (field: string) => {
  const fieldLabels: Record<string, string> = {
    endedAt: '종료 시간',
    durationMinutes: '작업 시간',
    shiftType: '근무형태',
    isDefective: '불량여부',
    memo: '메모',
  }
  return fieldLabels[field] || field
}

// 값 표시 변환
const formatValue = (field: string, value: string | null) => {
  if (!value) return '-'

  switch (field) {
    case 'endedAt':
      return format(new Date(value), 'yyyy-MM-dd HH:mm', { locale: ko })
    case 'durationMinutes':
      const minutes = parseInt(value)
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
    case 'shiftType':
      return getShiftTypeInfo(value).label
    case 'isDefective':
      return value === 'true' ? '불량' : '정상'
    default:
      return value
  }
}

// 모의 데이터 - 다양한 케이스
const mockWorkLogs: WorkLogDetail[] = [
  // 주간 정상 근무 (기본)
  {
    id: '1',
    userId: 'user1',
    processId: '1-1',
    startedAt: new Date('2024-01-15T09:00:00'),
    endedAt: new Date('2024-01-15T17:00:00'),
    durationMinutes: 480,
    shiftType: 'DAY_NORMAL',
    isDefective: false,
    memo: '정상 작업 완료. 품질 이상 없음.',
    user: { id: 'user1', name: '김철수', loginId: '2024001' },
    process: { id: '1-1', name: 'P1', line: { id: '1', name: 'MV L/R' } },
  },
  // 주간 잔업
  {
    id: '2',
    userId: 'user2',
    processId: '2-3',
    startedAt: new Date('2024-01-16T08:30:00'),
    endedAt: new Date('2024-01-16T19:30:00'),
    durationMinutes: 660,
    shiftType: 'DAY_OVERTIME',
    isDefective: false,
    memo: '긴급 주문으로 인한 연장 근무. 총 11시간 작업.',
    user: { id: 'user2', name: '이영희', loginId: '2024002' },
    process: { id: '2-3', name: 'P3', line: { id: '2', name: 'MX5 LH' } },
  },
  // 야간 정상 근무
  {
    id: '3',
    userId: 'user3',
    processId: '25-2',
    startedAt: new Date('2024-01-17T22:00:00'),
    endedAt: new Date('2024-01-18T06:00:00'),
    durationMinutes: 480,
    shiftType: 'NIGHT_NORMAL',
    isDefective: true,
    memo: '야간 근무 중 불량품 3건 발생. 원인 분석 필요.',
    user: { id: 'user3', name: '박민수', loginId: '2024003' },
    process: { id: '25-2', name: '조립피더', line: { id: '25', name: '린지원' } },
  },
  // 야간 잔업
  {
    id: '4',
    userId: 'user4',
    processId: '1-5',
    startedAt: new Date('2024-01-18T21:30:00'),
    endedAt: new Date('2024-01-19T08:30:00'),
    durationMinutes: 660,
    shiftType: 'NIGHT_OVERTIME',
    isDefective: false,
    memo: '설비 점검 후 야간 연장 근무. 예방 정비 완료.',
    user: { id: 'user4', name: '정현우', loginId: '2024004' },
    process: { id: '1-5', name: 'P5', line: { id: '1', name: 'MV L/R' } },
  },
  // 진행 중인 작업 (종료시간 없음)
  {
    id: '5',
    userId: 'user5',
    processId: '2-1',
    startedAt: new Date('2024-01-19T14:00:00'),
    endedAt: null,
    durationMinutes: 0,
    shiftType: 'UNKNOWN',
    isDefective: false,
    memo: '현재 진행 중인 작업',
    user: { id: 'user5', name: '최지은', loginId: '2024005' },
    process: { id: '2-1', name: 'P1', line: { id: '2', name: 'MX5 LH' } },
  },
]

// URL ID에 따라 다른 목업 데이터 선택하는 함수
const getMockWorkLogById = (id: string): WorkLogDetail => {
  const idNum = parseInt(id) || 1
  const index = (idNum - 1) % mockWorkLogs.length
  return mockWorkLogs[index]
}

const mockHistory: WorkLogHistory[] = [
  {
    id: '1',
    field: 'memo',
    oldValue: '작업 중',
    newValue: '정상 작업 완료. 품질 이상 없음.',
    changedBy: 'admin1',
    changedAt: new Date('2024-01-15T17:30:00'),
    admin: { id: 'admin1', name: '최승혁', loginId: '104880' },
  },
  {
    id: '2',
    field: 'endedAt',
    oldValue: null,
    newValue: '2024-01-15T17:00:00',
    changedBy: 'admin1',
    changedAt: new Date('2024-01-15T17:00:30'),
    admin: { id: 'admin1', name: '최승혁', loginId: '104880' },
  },
  {
    id: '3',
    field: 'shiftType',
    oldValue: 'UNKNOWN',
    newValue: 'DAY_NORMAL',
    changedBy: 'admin2',
    changedAt: new Date('2024-01-15T16:45:00'),
    admin: { id: 'admin2', name: '김관리', loginId: '105001' },
  },
  {
    id: '4',
    field: 'isDefective',
    oldValue: 'true',
    newValue: 'false',
    changedBy: 'admin1',
    changedAt: new Date('2024-01-15T16:30:00'),
    admin: { id: 'admin1', name: '최승혁', loginId: '104880' },
  },
  {
    id: '5',
    field: 'durationMinutes',
    oldValue: '475',
    newValue: '480',
    changedBy: 'admin2',
    changedAt: new Date('2024-01-15T17:00:45'),
    admin: { id: 'admin2', name: '김관리', loginId: '105001' },
  },
]

const WorkLogDetailPage = () => {
  const params = useParams()
  const workLogId = params.id as string

  const [workLog, setWorkLog] = useState<WorkLogDetail>(getMockWorkLogById(workLogId))
  const [history] = useState<WorkLogHistory[]>(mockHistory)
  const [isEditing, setIsEditing] = useState(false)
  const [isMemoEditing, setIsMemoEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data } = useQuery({
    queryKey: ['getWorkLogByIdApi', workLogId],
    queryFn: async () => await getWorkLogByIdApi(workLogId),
    select: (response) => response?.data?.workLogs || null,
  })

  type EditForm = {
    lineName: string
    lineClassNo: string
    processName: string
    startedAt: Date
    endedAt: Date | null
    durationMinutes: number | null
    shiftType: ShiftType
    workState: WorkStatus
    isDefective: string
  }

  // 수정 폼 상태
  const [editForm, setEditForm] = useState<EditForm>({
    lineName: '',
    lineClassNo: '1',
    processName: '',
    startedAt: new Date(),
    endedAt: null,
    durationMinutes: null,
    shiftType: ShiftType.DAY,
    workState: WorkStatus.NORMAL,
    isDefective: '',
  })

  // 메모 수정 폼 상태
  const [memoForm, setMemoForm] = useState({
    memo: workLog.memo,
  })

  // 수정 시작
  const handleEditStart = () => {
    if (!data) return
    setEditForm({
      lineName: data.lineName,
      lineClassNo: data.lineClassNo.toString(),
      processName: data.processName,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      durationMinutes: data.durationMinutes,
      shiftType: data.shiftType,
      workState: data.workStatus,
      isDefective: data.isDefective.toString(),
    })
    setIsEditing(true)
  }

  // 메모 수정 시작
  const handleMemoEditStart = () => {
    setMemoForm({
      memo: workLog.memo,
    })
    setIsMemoEditing(true)
  }

  // 수정 취소
  const handleEditCancel = () => {
    setIsEditing(false)
  }

  // 메모 수정 취소
  const handleMemoEditCancel = () => {
    setIsMemoEditing(false)
  }

  // 작업기록 삭제
  const handleDelete = async () => {
    // if (
    //   confirm(
    //     `정말로 이 작업 기록을 삭제하시겠습니까?\n\n` +
    //       `삭제된 데이터는 복구할 수 없습니다.\n` +
    //       `관련 수정 히스토리도 함께 삭제됩니다.`,
    //   )
    // ) {
    //   try {
    //     // API 호출 로직
    //     setLoading(true)
    //     // const response = await fetch(`/api/worklog/${workLogId}`, {
    //     //   method: 'DELETE',
    //     //   headers: { 'Content-Type': 'application/json' },
    //     // })
    //     // if (response.ok) {
    //     alert('삭제 완료되었습니다.')
    //     router.push('/admin/work-log')
    //     // } else {
    //     //   throw new Error('삭제 실패')
    //     // }
    //   } catch (error) {
    //     console.error('작업기록 삭제 실패:', error)
    //     alert('삭제 중 오류가 발생했습니다.')
    //   } finally {
    //     setLoading(false)
    //   }
    // }
  }

  // 수정 저장
  const handleEditSave = async () => {
    console.log('edit', editForm)

    // setLoading(true)
    // try {
    //   // 선택된 라인과 공정 찾기
    //   const selectedLine = linesData.find((line) => line.id === editForm.lineId)
    //   const selectedProcess = selectedLine?.processes.find(
    //     (process) => process.id === editForm.processId,
    //   )
    //
    //   if (!selectedLine || !selectedProcess) {
    //     alert('라인과 공정을 올바르게 선택해주세요.')
    //     return
    //   }
    //
    //   // 작업 시간 자동 계산
    //   const calculatedDuration = calculateDuration(editForm.startedAt, editForm.endedAt)
    //
    //   // API 호출 로직
    //   const updatedWorkLog = {
    //     ...workLog,
    //     processId: editForm.processId,
    //     startedAt: new Date(editForm.startedAt),
    //     endedAt: editForm.endedAt ? new Date(editForm.endedAt) : null,
    //     durationMinutes: calculatedDuration,
    //     shiftType: editForm.shiftType as any,
    //     isDefective: editForm.isDefective === 'true',
    //     process: {
    //       ...workLog.process,
    //       id: editForm.processId,
    //       name: selectedProcess.name,
    //       line: {
    //         id: selectedLine.id,
    //         name: selectedLine.name,
    //       },
    //     },
    //   }
    //   setWorkLog(updatedWorkLog)
    //   setIsEditing(false)
    //   alert('수정이 완료되었습니다.')
    // } catch (error) {
    //   console.error('수정 실패:', error)
    //   alert('수정 중 오류가 발생했습니다.')
    // } finally {
    //   setLoading(false)
    // }
  }

  // 메모 저장
  const handleMemoSave = async () => {
    setLoading(true)
    try {
      // API 호출 로직
      const updatedWorkLog = {
        ...workLog,
        memo: memoForm.memo,
      }
      setWorkLog(updatedWorkLog)
      setIsMemoEditing(false)
      alert('메모가 저장되었습니다.')
    } catch (error) {
      console.error('메모 저장 실패:', error)
      alert('메모 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {data && (
        <div className="space-y-6">
          {/* 작업 기록 정보 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-2.5">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  작업 정보
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditStart}
                    disabled={isEditing}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isEditing || loading}
                    className="border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
                    {isEditing ? (
                      <Select
                        value={editForm.shiftType ?? undefined}
                        onValueChange={(value: ShiftType) =>
                          setEditForm((prev: EditForm) => {
                            return {
                              ...prev,
                              shiftType: value,
                            }
                          })
                        }
                      >
                        <SelectTrigger
                          className="w-full h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                          style={{ height: '44px', minHeight: '44px' }}
                        >
                          <SelectValue placeholder="시간대 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ShiftType.DAY}>
                            {displayShiftType(ShiftType.DAY)}
                          </SelectItem>
                          <SelectItem value={ShiftType.NIGHT}>
                            {displayShiftType(ShiftType.NIGHT)}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <ShiftTypeLabel shiftType={data.shiftType} size={'lg'} />
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                    {isEditing ? (
                      <Select
                        value={editForm?.workState}
                        onValueChange={(value: WorkStatus) =>
                          setEditForm((prev) => ({ ...prev, workState: value }))
                        }
                      >
                        <SelectTrigger
                          className="w-full h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                          style={{ height: '44px', minHeight: '44px' }}
                        >
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NORMAL">
                            {displayWorkStatus(WorkStatus.NORMAL)}
                          </SelectItem>
                          <SelectItem value="OVERTIME">
                            {displayWorkStatus(WorkStatus.OVERTIME)}
                          </SelectItem>
                          <SelectItem value="EXTENDED">
                            {displayWorkStatus(WorkStatus.EXTENDED)}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <ShiftStatusLabel status={data.workStatus} size={'lg'} />
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">품질</label>
                    {isEditing ? (
                      <Select
                        value={editForm.isDefective}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, isDefective: value }))
                        }
                      >
                        <SelectTrigger
                          className="w-full h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                          style={{ height: '44px', minHeight: '44px' }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">정상</SelectItem>
                          <SelectItem value="true">불량</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <>
                        <DefectiveLabel value={data.isDefective} size={'lg'} />
                      </>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">반</label>
                    {isEditing ? (
                      <Select
                        value={editForm?.lineClassNo}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, lineClassNo: value }))
                        }
                      >
                        <SelectTrigger
                          className="w-full h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base"
                          style={{ height: '44px', minHeight: '44px' }}
                        >
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={'1'}>1</SelectItem>
                          <SelectItem value={'2'}>2</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                        {data.lineClassNo}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">라인</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editForm.lineName}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, lineName: e.target.value }))
                        }
                        className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg"
                        style={{ fontSize: '16px' }}
                      />
                    ) : (
                      <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                        {data.lineName}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">공정</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editForm.processName}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, processName: e.target.value }))
                        }
                        className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg"
                        style={{ fontSize: '16px' }}
                      />
                    ) : (
                      <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                        {data.processName}
                      </div>
                    )}
                  </div>
                </div>

                {/* 시작시간, 종료시간, 작업시간 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작 시간
                    </label>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={
                          editForm.startedAt
                            ? format(new Date(editForm.startedAt), "yyyy-MM-dd'T'HH:mm")
                            : ''
                        }
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            startedAt: e.target.value ? new Date(e.target.value) : new Date(),
                          }))
                        }
                        max={
                          editForm.endedAt
                            ? format(new Date(editForm.endedAt), "yyyy-MM-dd'T'HH:mm")
                            : format(new Date(), "yyyy-MM-dd'T'HH:mm")
                        }
                        className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg"
                        style={{ fontSize: '16px' }}
                      />
                    ) : (
                      <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                        {format(data.startedAt, 'yyyy-MM-dd HH:mm', { locale: ko })}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료 시간
                    </label>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={
                          editForm.endedAt
                            ? format(new Date(editForm.endedAt), "yyyy-MM-dd'T'HH:mm")
                            : ''
                        }
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            endedAt: e.target.value ? new Date(e.target.value) : null,
                          }))
                        }
                        min={format(new Date(editForm.startedAt), "yyyy-MM-dd'T'HH:mm")}
                        max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                        className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-lg"
                        style={{ fontSize: '16px' }}
                      />
                    ) : (
                      <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                        {data.endedAt
                          ? format(data.endedAt, 'yyyy-MM-dd HH:mm', { locale: ko })
                          : '진행 중'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      작업 시간
                    </label>
                    <div className="text-lg text-gray-900 bg-gray-100 px-4 py-2 rounded-lg border-gray-300">
                      {isEditing ? (
                        <>
                          {editForm.endedAt ? (
                            <>
                              {displayMinutes(
                                differenceInMinutes(
                                  new Date(editForm.endedAt),
                                  new Date(editForm.startedAt),
                                ),
                              )}
                            </>
                          ) : (
                            '0분'
                          )}
                        </>
                      ) : (
                        <>{data.durationMinutes ? displayMinutes(data.durationMinutes) : '-'}</>
                      )}
                    </div>
                  </div>
                </div>

                {/* 직원 정보 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">작업자</label>
                    <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      <div className="font-medium">
                        {data.userName}({data.userUserId})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 편집 모드일 때 저장/취소 버튼 */}
            {isEditing && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleEditCancel}
                    disabled={loading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleEditSave}
                    disabled={loading}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {loading ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 메모 섹션 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-2.5">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  작업 메모
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMemoEditStart}
                    disabled={isMemoEditing}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    수정
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isMemoEditing ? (
                <Textarea
                  value={memoForm.memo}
                  onChange={(e) => setMemoForm((prev) => ({ ...prev, memo: e.target.value }))}
                  placeholder="메모를 입력하세요"
                  rows={6}
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 md:text-base text-base min-h-42"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg min-h-[150px] whitespace-pre-wrap">
                  {workLog.memo || '메모가 없습니다.'}
                </div>
              )}
            </div>

            {/* 메모 편집 모드일 때 저장/취소 버튼 */}
            {isMemoEditing && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleMemoEditCancel}
                    disabled={loading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleMemoSave}
                    disabled={loading}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {loading ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 수정 히스토리 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                관리자 수정 히스토리
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {getFieldLabel(item.field)}
                          </span>
                          <span className="text-sm text-gray-600">수정됨</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(item.changedAt, 'yyyy-MM-dd HH:mm', { locale: ko })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-gray-500 min-w-[40px]">이전:</span>
                          <span className="font-medium">
                            {formatValue(item.field, item.oldValue)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-gray-500 min-w-[40px]">변경:</span>
                          <span className="font-medium text-blue-600">
                            {formatValue(item.field, item.newValue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 min-w-[40px]">수정자:</span>
                          <span className="font-medium">
                            {item.admin.name} ({item.admin.loginId})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">수정 히스토리가 없습니다.</p>
                    <p className="text-sm mt-1">
                      작업 기록이 수정되면 여기에 히스토리가 표시됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default WorkLogDetailPage
