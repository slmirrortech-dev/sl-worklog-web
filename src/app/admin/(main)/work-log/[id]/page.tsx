'use client'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Edit, User, FileText, Trash2, Check } from 'lucide-react'
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
import {
  deleteWorkLogByIdApi,
  getWorkLogByIdApi,
  getWorkLogHistoryByIdApi,
  updateWorkLogByIdApi,
} from '@/lib/api/work-log-api'
import ShiftTypeLabel from '@/components/admin/ShiftTypeLabel'
import { ShiftType, WorkStatus } from '@prisma/client'
import { displayWorkStatus } from '@/lib/utils/shift-status'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { displayShiftType } from '@/lib/utils/shift-type'
import DefectiveLabel from '@/components/admin/DefectiveLabel'
import { displayMinutes } from '@/lib/utils/time'
import { updateWorkLogRequestModel, workLogHistoryResponseDto } from '@/types/work-log'
import { ROUTES } from '@/lib/constants/routes'
import { useLoading } from '@/contexts/LoadingContext'

// 필드명 한국어 변환
const getFieldLabel = (field: string) => {
  const fieldLabels: Record<string, string> = {
    startedAt: '시작 시간',
    endedAt: '종료 시간',
    durationMinutes: '작업 시간',
    workStatus: '작업장 상태',
    shiftType: '시간대',
    isDefective: '불량여부',
    memo: '메모',
    lineName: '라인',
    lineClassNo: '반',
    processName: '공정',
  }
  return fieldLabels[field] || field
}

// 값 표시 변환
const formatValue = (field: string, value: string | null) => {
  if (!value) return '-'

  switch (field) {
    case 'startedAt':
      return format(new Date(value), 'yyyy-MM-dd HH:mm', { locale: ko })
    case 'endedAt':
      return format(new Date(value), 'yyyy-MM-dd HH:mm', { locale: ko })
    case 'durationMinutes':
      return displayMinutes(Number(value))
    case 'workStatus':
      return displayWorkStatus(value as WorkStatus)
    case 'shiftType':
      return displayShiftType(value as ShiftType)
    case 'isDefective':
      return value === 'true' ? '불량' : '정상'
    case 'lineClassNo':
      return value + '반'
    default:
      return value
  }
}

export type EditWorkLogForm = {
  lineName: string
  lineClassNo: string
  processName: string
  startedAt: Date
  endedAt: Date | null
  durationMinutes: number | null
  shiftType: ShiftType
  workStatus: WorkStatus
  isDefective: string
}

const WorkLogDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const workLogId = params.id as string
  const { showLoading, hideLoading } = useLoading()

  const [isEditing, setIsEditing] = useState(false)
  const [isMemoEditing, setIsMemoEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['getWorkLogByIdApi', workLogId],
    queryFn: async () => await getWorkLogByIdApi(workLogId),
    select: (response) => response?.data?.workLogs || null,
  })

  const { data: historyData, refetch: historyRefetch } = useQuery({
    queryKey: ['getWorkLogHistoryByIdApi', workLogId],
    queryFn: async () => await getWorkLogHistoryByIdApi(workLogId),
    select: (response) => {
      if (response.data) {
        return response.data
      } else {
        return []
      }
    },
  })

  // 수정 폼 상태
  // TODO: 불필요한 초기 값 삭제하기
  const [editForm, setEditForm] = useState<EditWorkLogForm>({
    lineName: '',
    lineClassNo: '',
    processName: '',
    startedAt: new Date(),
    endedAt: null,
    durationMinutes: null,
    shiftType: ShiftType.DAY,
    workStatus: WorkStatus.NORMAL,
    isDefective: '',
  })

  // 메모 수정 폼 상태
  const [memo, setMemo] = useState('')

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
      workStatus: data.workStatus,
      isDefective: data.isDefective.toString(),
    })
    setIsEditing(true)
  }

  // 수정 취소
  const handleEditCancel = () => {
    setIsEnd(false)
    setIsEditing(false)
  }

  // 작업기록 삭제
  const handleDelete = async () => {
    if (
      confirm(
        `정말로 이 작업 기록을 삭제하시겠습니까?\n\n` +
          `삭제된 데이터는 복구할 수 없습니다.\n` +
          `관련 수정 히스토리도 함께 삭제됩니다.`,
      )
    ) {
      showLoading()
      try {
        await deleteWorkLogByIdApi(data?.id || '')
        hideLoading()
        alert('삭제 완료했습니다.')
        router.replace(ROUTES.ADMIN.WORK_LOG)
      } catch (error) {
        hideLoading()
        alert('작업 기록 삭제에 실패했습니다. 다시 시도해주세요.')
        refetch()
        historyRefetch()
      }
    }
  }

  const [isEnd, setIsEnd] = useState(false)

  // 수정 저장
  const handleEditSave = async () => {
    if (data && editForm) {
      const newData: Partial<updateWorkLogRequestModel> = {}

      if (isEnd && editForm.endedAt) {
        newData.endedAt = editForm.endedAt

        setLoading(true)
        try {
          await updateWorkLogByIdApi(data.id, newData)

          setIsEditing(false)
          setIsEnd(false)
          refetch()
          historyRefetch()
        } catch (e) {
          alert('작업 종료에 실패했습니다.')
        } finally {
          setLoading(false)
        }

        return
      }

      // 변경된 필드만 추가
      if (editForm.workStatus !== data.workStatus) {
        newData.workStatus = editForm.workStatus
      }
      if (editForm.shiftType !== data.shiftType) {
        newData.shiftType = editForm.shiftType
      }
      if (JSON.parse(editForm.isDefective) !== data.isDefective) {
        newData.isDefective = JSON.parse(editForm.isDefective)
      }
      if (
        format(editForm.startedAt, 'yyyy-MM-ddTHH:mm') !==
        format(data.startedAt, 'yyyy-MM-ddTHH:mm')
      ) {
        newData.startedAt = editForm.startedAt
      }
      if (
        editForm.endedAt &&
        format(editForm.endedAt, 'yyyy-MM-ddTHH:mm') !== format(data.endedAt, 'yyyy-MM-ddTHH:mm')
      ) {
        newData.endedAt = editForm.endedAt
      }
      if (editForm.lineName !== data.lineName) {
        newData.lineName = editForm.lineName
      }
      if (Number(editForm.lineClassNo) !== data.lineClassNo) {
        newData.lineClassNo = Number(editForm.lineClassNo)
      }
      if (editForm.processName !== data.processName) {
        newData.processName = editForm.processName
      }

      // 변경된 필드가 있을 때만 API 호출
      if (Object.keys(newData).length > 0) {
        setLoading(true)
        try {
          await updateWorkLogByIdApi(data.id, newData)

          setIsEditing(false)
          setIsEnd(false)
          refetch()
          historyRefetch()
        } catch (e) {
          alert('작업 종료에 실패했습니다.')
        } finally {
          setLoading(false)
        }
      } else {
        alert('변경된 데이터가 없습니다.')
        refetch()
        historyRefetch()
        setIsEditing(false)
        setIsEnd(false)
      }
    }
  }

  // 메모 수정 시작
  const handleMemoEditStart = () => {
    setMemo(data?.memo || '')
    setIsMemoEditing(true)
  }
  // 메모 수정 취소
  const handleMemoEditCancel = () => {
    setIsMemoEditing(false)
  }

  // 메모 저장
  const handleMemoSave = async () => {
    if (!memo || !data) {
      setIsMemoEditing(false)
      return
    }

    setLoading(true)
    try {
      await updateWorkLogByIdApi(data.id, {
        memo,
      })
      setIsMemoEditing(false)
      refetch().then((response) => {
        setMemo(response?.data?.memo || '')
      })
      historyRefetch()
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
                {data.endedAt ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditStart}
                      disabled={isEditing || !data.endedAt}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isEditing || loading || !data.endedAt}
                      className="border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {!isEnd && (
                      <Button
                        variant={'default'}
                        size={'sm'}
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => {
                          setIsEnd(true)
                          setEditForm((prev) => ({
                            ...prev,
                            endedAt: new Date(),
                          }))
                        }}
                      >
                        강제 종료
                      </Button>
                    )}
                  </div>
                )}
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
                          setEditForm((prev) => {
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
                        value={editForm?.workStatus}
                        onValueChange={(value: WorkStatus) =>
                          setEditForm((prev) => ({ ...prev, workStatus: value }))
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

                  {/* 직원 정보 */}
                  <div className="md:hidden lg:col-span-1 lg:block"></div>
                  <div className="col-span-1 md:col-span-3 lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">작업자</label>
                    <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex justify-between">
                      <div className="font-medium">
                        {data.userName}({data.userUserId})
                      </div>
                      {data.userId !== null && (
                        <Button
                          variant={'default'}
                          size={'sm'}
                          onClick={() => {
                            router.push(`${ROUTES.ADMIN.USERS}/${data.userId}`)
                          }}
                        >
                          관리
                        </Button>
                      )}
                    </div>
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
                    {isEditing || isEnd ? (
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
                      <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex justify-between items-center">
                        {data.endedAt ? (
                          format(data.endedAt, 'yyyy-MM-dd HH:mm', { locale: ko })
                        ) : (
                          <>
                            <span>진행 중</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      작업 시간
                    </label>
                    <div className="text-lg text-gray-900 bg-gray-100 px-4 py-2 rounded-lg border-gray-300">
                      {isEnd || isEditing ? (
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
                            '-'
                          )}
                        </>
                      ) : (
                        <>
                          {data.durationMinutes !== null
                            ? displayMinutes(data.durationMinutes)
                            : '-'}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

            {isEnd && (
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
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Check />
                    {loading ? '종료 중...' : '종료'}
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
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 입력하세요"
                  rows={6}
                  className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 md:text-base text-base min-h-42"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg min-h-[150px] whitespace-pre-wrap">
                  {data?.memo || '-'}
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
          {historyData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  관리자 수정 히스토리
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {historyData.length > 0 ? (
                    historyData.map((item: workLogHistoryResponseDto) => (
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
                              {item.changedByName} ({item.changedByUserId})
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
          )}
        </div>
      )}
    </main>
  )
}

export default WorkLogDetailPage
