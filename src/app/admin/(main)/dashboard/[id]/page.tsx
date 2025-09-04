'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  FileText,
  Calendar,
  Trash2,
} from 'lucide-react'
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
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

// 타입 정의
interface WorkLogDetail {
  id: string
  userId: string
  processId: string
  startedAt: Date
  endedAt: Date | null
  durationMinutes: number
  shiftType: 'DAY' | 'NIGHT' | 'OVERTIME' | 'UNKNOWN'
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
    case 'DAY':
      return { label: '주간', color: 'bg-blue-100 text-blue-800' }
    case 'NIGHT':
      return { label: '야간', color: 'bg-purple-100 text-purple-800' }
    case 'OVERTIME':
      return { label: '잔업', color: 'bg-orange-100 text-orange-800' }
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

// 라인과 공정 데이터
const linesData = [
  {
    id: '1',
    name: 'MV L/R',
    processes: [
      { id: '1-1', name: 'P1' },
      { id: '1-2', name: 'P2' },
      { id: '1-3', name: 'P3' },
      { id: '1-4', name: 'P4' },
      { id: '1-5', name: 'P5' },
      { id: '1-6', name: 'P6' },
      { id: '1-7', name: 'P7' },
    ],
  },
  {
    id: '2',
    name: 'MX5 LH',
    processes: [
      { id: '2-1', name: 'P1' },
      { id: '2-2', name: 'P2' },
      { id: '2-3', name: 'P3' },
      { id: '2-4', name: 'P4' },
      { id: '2-5', name: 'P5' },
      { id: '2-6', name: 'P6' },
      { id: '2-7', name: 'P7' },
    ],
  },
  {
    id: '25',
    name: '린지원',
    processes: [
      { id: '25-1', name: '서열피더' },
      { id: '25-2', name: '조립피더' },
      { id: '25-3', name: '리워크' },
      { id: '25-4', name: '폴리싱' },
      { id: '25-5', name: '서열대차' },
    ],
  },
]

// 모의 데이터
const mockWorkLog: WorkLogDetail = {
  id: '1',
  userId: 'user1',
  processId: 'process1',
  startedAt: new Date('2024-01-15T09:00:00'),
  endedAt: new Date('2024-01-15T17:00:00'),
  durationMinutes: 480,
  shiftType: 'DAY',
  isDefective: false,
  memo: '정상 작업 완료',
  user: { id: 'user1', name: '김철수', loginId: '2024001' },
  process: { id: 'process1', name: 'P1', line: { id: 'line1', name: 'MV L/R' } },
}

const mockHistory: WorkLogHistory[] = [
  {
    id: '1',
    field: 'memo',
    oldValue: '작업 중',
    newValue: '정상 작업 완료',
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
]

const WorkLogDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const workLogId = params.id as string

  const [workLog, setWorkLog] = useState<WorkLogDetail>(mockWorkLog)
  const [history] = useState<WorkLogHistory[]>(mockHistory)
  const [isEditing, setIsEditing] = useState(false)
  const [isMemoEditing, setIsMemoEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // 수정 폼 상태
  const [editForm, setEditForm] = useState({
    lineId: workLog.process.line.id,
    processId: workLog.processId,
    startedAt: format(workLog.startedAt, "yyyy-MM-dd'T'HH:mm"),
    endedAt: workLog.endedAt ? format(workLog.endedAt, "yyyy-MM-dd'T'HH:mm") : '',
    shiftType: workLog.shiftType,
    isDefective: workLog.isDefective.toString(),
  })

  // 메모 수정 폼 상태
  const [memoForm, setMemoForm] = useState({
    memo: workLog.memo,
  })

  // 작업 시간 자동 계산
  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 0
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    return Math.max(0, Math.floor(diffMs / (1000 * 60))) // 분 단위
  }

  // 수정 시작
  const handleEditStart = () => {
    setEditForm({
      lineId: workLog.process.line.id,
      processId: workLog.processId,
      startedAt: format(workLog.startedAt, "yyyy-MM-dd'T'HH:mm"),
      endedAt: workLog.endedAt ? format(workLog.endedAt, "yyyy-MM-dd'T'HH:mm") : '',
      shiftType: workLog.shiftType,
      isDefective: workLog.isDefective.toString(),
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
    if (
      confirm(
        `정말로 이 작업 기록을 삭제하시겠습니까?\n\n` +
          `삭제된 데이터는 복구할 수 없습니다.\n` +
          `관련 수정 히스토리도 함께 삭제됩니다.`,
      )
    ) {
      try {
        // API 호출 로직
        setLoading(true)
        // const response = await fetch(`/api/worklog/${workLogId}`, {
        //   method: 'DELETE',
        //   headers: { 'Content-Type': 'application/json' },
        // })
        // if (response.ok) {
        alert('삭제 완료되었습니다.')
        router.push('/admin/dashboard')
        // } else {
        //   throw new Error('삭제 실패')
        // }
      } catch (error) {
        console.error('작업기록 삭제 실패:', error)
        alert('삭제 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
  }

  // 수정 저장
  const handleEditSave = async () => {
    setLoading(true)
    try {
      // 선택된 라인과 공정 찾기
      const selectedLine = linesData.find((line) => line.id === editForm.lineId)
      const selectedProcess = selectedLine?.processes.find(
        (process) => process.id === editForm.processId,
      )

      if (!selectedLine || !selectedProcess) {
        alert('라인과 공정을 올바르게 선택해주세요.')
        return
      }

      // 작업 시간 자동 계산
      const calculatedDuration = calculateDuration(editForm.startedAt, editForm.endedAt)

      // API 호출 로직
      const updatedWorkLog = {
        ...workLog,
        processId: editForm.processId,
        startedAt: new Date(editForm.startedAt),
        endedAt: editForm.endedAt ? new Date(editForm.endedAt) : null,
        durationMinutes: calculatedDuration,
        shiftType: editForm.shiftType as any,
        isDefective: editForm.isDefective === 'true',
        process: {
          ...workLog.process,
          id: editForm.processId,
          name: selectedProcess.name,
          line: {
            id: selectedLine.id,
            name: selectedLine.name,
          },
        },
      }
      setWorkLog(updatedWorkLog)
      setIsEditing(false)
      alert('수정이 완료되었습니다.')
    } catch (error) {
      console.error('수정 실패:', error)
      alert('수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
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

  const { label: shiftLabel, color: shiftColor } = getShiftTypeInfo(workLog.shiftType)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {/* 공정면허증, 직원 정보 */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* 공정면허증 */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FileText className="w-4 h-4 inline mr-1" />
                    공정면허증
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">면허증 이미지</p>
                  </div>
                </div>

                {/* 직원 정보 */}
                <div className="lg:col-span-3 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사번</label>
                    <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      <div className="font-medium">{workLog.user.loginId}</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                    <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg flex justify-between align-items-center">
                      <div className="font-medium">{workLog.user.name}</div>
                      <Button
                        variant={'default'}
                        // onClick={() => router.push(`/admin/users/${workLog.user.id}`)}
                        onClick={() => router.push(`/admin/users/cmf5dacsc0000hazh0n6jkrdq`)}
                      >
                        관리
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 라인, 공정 */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">라인</label>
                  {isEditing ? (
                    <Select
                      value={editForm.lineId}
                      onValueChange={(value) => {
                        setEditForm((prev) => ({
                          ...prev,
                          lineId: value,
                          processId: '', // 라인 변경시 공정 초기화
                        }))
                      }}
                    >
                      <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="라인 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {linesData.map((line) => (
                          <SelectItem key={line.id} value={line.id}>
                            {line.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      {workLog.process.line.name}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">공정</label>
                  {isEditing ? (
                    <Select
                      value={editForm.processId}
                      onValueChange={(value) =>
                        setEditForm((prev) => ({ ...prev, processId: value }))
                      }
                      disabled={!editForm.lineId}
                    >
                      <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="공정 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {editForm.lineId &&
                          linesData
                            .find((line) => line.id === editForm.lineId)
                            ?.processes.map((process) => (
                              <SelectItem key={process.id} value={process.id}>
                                {process.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      {workLog.process.name}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">근무형태</label>
                    {isEditing ? (
                      <Select
                        value={editForm.shiftType}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, shiftType: value as any }))
                        }
                      >
                        <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAY">주간</SelectItem>
                          <SelectItem value="NIGHT">야간</SelectItem>
                          <SelectItem value="OVERTIME">잔업</SelectItem>
                          <SelectItem value="UNKNOWN">미분류</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium ${shiftColor}`}
                        >
                          {shiftLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">불량여부</label>
                    {isEditing ? (
                      <Select
                        value={editForm.isDefective}
                        onValueChange={(value) =>
                          setEditForm((prev) => ({ ...prev, isDefective: value }))
                        }
                      >
                        <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">정상</SelectItem>
                          <SelectItem value="true">불량</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium ${
                            workLog.isDefective
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}
                        >
                          {workLog.isDefective && <AlertTriangle className="w-4 h-4 mr-1" />}
                          {workLog.isDefective ? '불량' : '정상'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 세번째 줄: 시작시간, 종료시간, 작업시간 */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
                  {isEditing ? (
                    <Input
                      type="datetime-local"
                      value={editForm.startedAt}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, startedAt: e.target.value }))
                      }
                      className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      {format(workLog.startedAt, 'yyyy-MM-dd HH:mm', { locale: ko })}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
                  {isEditing ? (
                    <Input
                      type="datetime-local"
                      value={editForm.endedAt}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, endedAt: e.target.value }))
                      }
                      className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      {workLog.endedAt
                        ? format(workLog.endedAt, 'yyyy-MM-dd HH:mm', { locale: ko })
                        : '진행중'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">작업 시간</label>
                  <div className="text-lg text-gray-900 bg-gray-100 px-4 py-2 rounded-lg border-gray-300">
                    {isEditing
                      ? // 편집 모드에서는 실시간 계산된 시간 표시
                        (() => {
                          const duration = calculateDuration(editForm.startedAt, editForm.endedAt)
                          const hours = Math.floor(duration / 60)
                          const minutes = duration % 60
                          return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                        })()
                      : // 표시 모드에서는 저장된 시간 표시
                        Math.floor(workLog.durationMinutes / 60) > 0
                        ? `${Math.floor(workLog.durationMinutes / 60)}h ${workLog.durationMinutes % 60}m`
                        : `${workLog.durationMinutes}m`}
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
                메모
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
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                  <p className="text-sm mt-1">작업 기록이 수정되면 여기에 히스토리가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default WorkLogDetailPage
