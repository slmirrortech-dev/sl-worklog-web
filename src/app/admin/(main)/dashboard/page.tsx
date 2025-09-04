'use client'
import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CustomDataTable } from '@/components/CustomDataTable'
import { CalendarIcon, Search, RotateCcw, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

// WorkLog 타입 정의
interface WorkLog {
  id: string
  userId: string
  processId: string
  startedAt: Date
  endedAt: Date | null
  durationMinutes: number
  isDefective: boolean
  user: {
    id: string
    name: string
    employeeId: string
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

// 검색 필터 타입
interface SearchFilters {
  startDate: Date | null
  endDate: Date | null
  workType: 'all' | 'day' | 'night' | 'overtime' | 'unclassified'
  isDefective: 'all' | 'true' | 'false'
  employeeSearch: string
  lineId: string
  processId: string
  dateRange: '1day' | '1week' | '1month' | 'custom'
}

// 근무형태 계산 함수
const getWorkType = (startedAt: Date, endedAt: Date | null, durationMinutes: number) => {
  if (durationMinutes < 5) return 'unclassified'

  if (!endedAt) return 'unclassified'

  const middleTime = new Date(startedAt.getTime() + (endedAt.getTime() - startedAt.getTime()) / 2)
  const hour = middleTime.getHours()

  if (hour >= 8 && hour < 17) return 'day' // 주간: 8시-17시
  if (hour >= 20 || hour < 5) return 'night' // 야간: 20시-5시
  if (hour >= 18 && hour < 20) return 'overtime' // 잔업: 18시-20시

  return 'unclassified'
}

// 근무형태 표시 컴포넌트
const WorkTypeBadge = ({ workType }: { workType: string }) => {
  const getWorkTypeInfo = (type: string) => {
    switch (type) {
      case 'day':
        return { label: '주간', color: 'bg-blue-100 text-blue-800' }
      case 'night':
        return { label: '야간', color: 'bg-purple-100 text-purple-800' }
      case 'overtime':
        return { label: '잔업', color: 'bg-orange-100 text-orange-800' }
      case 'unclassified':
        return { label: '미분류', color: 'bg-gray-100 text-gray-800' }
      default:
        return { label: '알 수 없음', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const { label, color } = getWorkTypeInfo(workType)
  return <span className={`px-2 py-1 text-xs rounded-full font-medium ${color}`}>{label}</span>
}

// 모의 데이터
const mockWorkLogs: WorkLog[] = [
  {
    id: '1',
    userId: 'user1',
    processId: 'process1',
    startedAt: new Date('2024-01-15T09:00:00'),
    endedAt: new Date('2024-01-15T17:00:00'),
    durationMinutes: 480,
    isDefective: false,
    user: { id: 'user1', name: '김철수', employeeId: '2024001' },
    process: { id: 'process1', name: 'P1', line: { id: 'line1', name: 'MV L/R' } },
  },
  {
    id: '2',
    userId: 'user2',
    processId: 'process2',
    startedAt: new Date('2024-01-15T20:00:00'),
    endedAt: new Date('2024-01-16T04:00:00'),
    durationMinutes: 480,
    isDefective: true,
    user: { id: 'user2', name: '이영희', employeeId: '2024002' },
    process: { id: 'process2', name: 'P2', line: { id: 'line1', name: 'MV L/R' } },
  },
  {
    id: '3',
    userId: 'user3',
    processId: 'process3',
    startedAt: new Date('2024-01-15T18:30:00'),
    endedAt: new Date('2024-01-15T19:30:00'),
    durationMinutes: 60,
    isDefective: false,
    user: { id: 'user3', name: '박민수', employeeId: '2024003' },
    process: { id: 'process3', name: '서열피더', line: { id: 'line2', name: '린지원' } },
  },
]

// 라인과 공정 데이터 (ProcessSetting에서 사용하는 것과 동일)
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

const DashboardPage = () => {
  const router = useRouter()
  const [workLogs, setWorkLogs] = useState<WorkLog[]>(mockWorkLogs)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(mockWorkLogs.length)
  const [totalPages, setTotalPages] = useState(Math.ceil(mockWorkLogs.length / 10))

  const [filters, setFilters] = useState<SearchFilters>(() => {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    
    return {
      startDate: startOfToday,
      endDate: endOfToday,
      workType: 'all',
      isDefective: 'all',
      employeeSearch: '',
      lineId: 'all',
      processId: 'all',
      dateRange: '1day',
    }
  })

  // 날짜가 오늘인지 확인하는 함수
  const isToday = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false
    
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    
    const isSameStart = date1.getTime() === startOfToday.getTime()
    const isSameEnd = Math.abs(date2.getTime() - endOfToday.getTime()) < 1000 // 1초 오차 허용
    
    return isSameStart && isSameEnd
  }

  // 현재 날짜 범위 자동 감지
  const getCurrentDateRange = () => {
    if (isToday(filters.startDate, filters.endDate)) {
      return '1day'
    }
    // 다른 범위도 필요하면 여기서 체크할 수 있음
    return 'custom'
  }

  // 날짜 범위 설정
  const setDateRange = (range: '1day' | '1week' | '1month') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let startDate: Date
    let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // 오늘 23:59:59

    switch (range) {
      case '1day':
        startDate = today
        break
      case '1week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '1month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
        break
      default:
        return
    }

    setFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
      dateRange: range,
    }))
  }

  // 필터 초기화
  const resetFilters = () => {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    
    setFilters({
      startDate: startOfToday,
      endDate: endOfToday,
      workType: 'all',
      isDefective: 'all',
      employeeSearch: '',
      lineId: 'all',
      processId: 'all',
      dateRange: '1day',
    })
  }

  // 검색 실행
  const handleSearch = () => {
    setLoading(true)
    // 실제 API 호출 로직이 들어갈 곳
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  // 테이블 컬럼 정의
  const columns: ColumnDef<WorkLog>[] = [
    {
      accessorKey: 'user.employeeId',
      header: '사번',
      cell: ({ row }) => <div className="font-mono text-sm">{row.original.user.employeeId}</div>,
    },
    {
      accessorKey: 'user.name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.original.user.name}</div>,
    },
    {
      accessorKey: 'process.line.name',
      header: '라인',
      cell: ({ row }) => <div className="text-sm">{row.original.process.line.name}</div>,
    },
    {
      accessorKey: 'process.name',
      header: '공정',
      cell: ({ row }) => <div className="text-sm font-medium">{row.original.process.name}</div>,
    },
    {
      accessorKey: 'startedAt',
      header: '시작 시간',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(row.original.startedAt, 'yyyy-MM-dd HH:mm', { locale: ko })}
        </div>
      ),
    },
    {
      accessorKey: 'endedAt',
      header: '종료 시간',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.endedAt
            ? format(row.original.endedAt, 'yyyy-MM-dd HH:mm', { locale: ko })
            : '진행중'}
        </div>
      ),
    },
    {
      accessorKey: 'durationMinutes',
      header: '작업 시간',
      cell: ({ row }) => {
        const minutes = row.original.durationMinutes
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return (
          <div className="text-sm font-medium">
            {hours > 0 ? `${hours}h ` : ''}
            {mins}m
          </div>
        )
      },
    },
    {
      id: 'workType',
      header: '근무형태',
      cell: ({ row }) => {
        const workType = getWorkType(
          row.original.startedAt,
          row.original.endedAt,
          row.original.durationMinutes,
        )
        return <WorkTypeBadge workType={workType} />
      },
    },
    {
      accessorKey: 'isDefective',
      header: '불량여부',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.original.isDefective ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {row.original.isDefective ? '불량' : '정상'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/dashboard/${row.original.id}`)}
          className="flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          상세
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col space-y-6">
      {/* 검색 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* PC: 첫 번째 행 - 날짜 및 빠른 선택 */}
          <div className="hidden lg:flex items-end gap-4">
            {/* 시작일 */}
            <div className="space-y-2 min-w-[140px]">
              <Label htmlFor="startDate">시작일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate
                      ? format(filters.startDate, 'yyyy-MM-dd', { locale: ko })
                      : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate || undefined}
                    onSelect={(date) =>
                      setFilters((prev) => ({
                        ...prev,
                        startDate: date || null,
                        dateRange: 'custom',
                      }))
                    }
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 종료일 */}
            <div className="space-y-2 min-w-[140px]">
              <Label htmlFor="endDate">종료일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate
                      ? format(filters.endDate, 'yyyy-MM-dd', { locale: ko })
                      : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate || undefined}
                    onSelect={(date) =>
                      setFilters((prev) => ({
                        ...prev,
                        endDate: date || null,
                        dateRange: 'custom',
                      }))
                    }
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 빠른 날짜 선택 버튼들 */}
            <Button
              variant={getCurrentDateRange() === '1day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('1day')}
            >
              오늘
            </Button>
            <Button
              variant={filters.dateRange === '1week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('1week')}
            >
              1주일
            </Button>
            <Button
              variant={filters.dateRange === '1month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('1month')}
            >
              1개월
            </Button>
          </div>

          {/* PC: 두 번째 행 - 카테고리 필터 및 검색 */}
          <div className="hidden lg:flex items-end gap-4">
            {/* 근무형태 */}
            <div className="space-y-2 w-[180px]">
              <Label>근무형태</Label>
              <Select
                value={filters.workType}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, workType: value as any }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="day">주간 (08:00-17:00)</SelectItem>
                  <SelectItem value="night">야간 (20:00-05:00)</SelectItem>
                  <SelectItem value="overtime">잔업 (18:00-20:00)</SelectItem>
                  <SelectItem value="unclassified">미분류 (5분 미만)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 라인 선택 */}
            <div className="space-y-2 w-[140px]">
              <Label>라인</Label>
              <Select
                value={filters.lineId}
                onValueChange={(value) => {
                  setFilters((prev) => ({
                    ...prev,
                    lineId: value,
                    processId: 'all', // 라인 변경시 공정 초기화
                  }))
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="라인 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {linesData.map((line) => (
                    <SelectItem key={line.id} value={line.id}>
                      {line.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 공정 선택 */}
            <div className="space-y-2 w-[120px]">
              <Label>공정</Label>
              <Select
                value={filters.processId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, processId: value }))}
                disabled={!filters.lineId || filters.lineId === 'all'}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="공정 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {filters.lineId &&
                    filters.lineId !== 'all' &&
                    linesData
                      .find((line) => line.id === filters.lineId)
                      ?.processes.map((process) => (
                        <SelectItem key={process.id} value={process.id}>
                          {process.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            {/* 불량여부 */}
            <div className="space-y-2 w-[100px]">
              <Label>불량여부</Label>
              <Select
                value={filters.isDefective}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, isDefective: value as any }))
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="false">정상</SelectItem>
                  <SelectItem value="true">불량</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 직원 검색 */}
            <div className="space-y-2 w-[200px]">
              <Label htmlFor="employeeSearch">직원 검색</Label>
              <Input
                id="employeeSearch"
                placeholder="이름 또는 사번으로 검색"
                value={filters.employeeSearch}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, employeeSearch: e.target.value }))
                }
                className="w-[200px]"
              />
            </div>
          </div>

          {/* 모바일/태블릿: 반응형 그리드 */}
          <div className="block lg:hidden space-y-4">
            {/* 날짜 선택 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 시작일 */}
              <div className="space-y-2">
                <Label htmlFor="startDate">시작일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate
                        ? format(filters.startDate, 'yyyy-MM-dd', { locale: ko })
                        : '날짜 선택'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate || undefined}
                      onSelect={(date) =>
                        setFilters((prev) => ({
                          ...prev,
                          startDate: date || null,
                          dateRange: 'custom',
                        }))
                      }
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 종료일 */}
              <div className="space-y-2">
                <Label htmlFor="endDate">종료일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate
                        ? format(filters.endDate, 'yyyy-MM-dd', { locale: ko })
                        : '날짜 선택'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate || undefined}
                      onSelect={(date) =>
                        setFilters((prev) => ({
                          ...prev,
                          endDate: date || null,
                          dateRange: 'custom',
                        }))
                      }
                      locale={ko}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 빠른 날짜 선택 버튼들 */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={getCurrentDateRange() === '1day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('1day')}
              >
                오늘
              </Button>
              <Button
                variant={filters.dateRange === '1week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('1week')}
              >
                1주일
              </Button>
              <Button
                variant={filters.dateRange === '1month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('1month')}
              >
                1개월
              </Button>
            </div>

            {/* 필터 선택 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 근무형태 */}
              <div className="space-y-2">
                <Label>근무형태</Label>
                <Select
                  value={filters.workType}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, workType: value as any }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="day">주간 (08:00-17:00)</SelectItem>
                    <SelectItem value="night">야간 (20:00-05:00)</SelectItem>
                    <SelectItem value="overtime">잔업 (18:00-20:00)</SelectItem>
                    <SelectItem value="unclassified">미분류 (5분 미만)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 라인 선택 */}
              <div className="space-y-2">
                <Label>라인</Label>
                <Select
                  value={filters.lineId}
                  onValueChange={(value) => {
                    setFilters((prev) => ({
                      ...prev,
                      lineId: value,
                      processId: 'all', // 라인 변경시 공정 초기화
                    }))
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="라인 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {linesData.map((line) => (
                      <SelectItem key={line.id} value={line.id}>
                        {line.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 공정 선택 */}
              <div className="space-y-2">
                <Label>공정</Label>
                <Select
                  value={filters.processId}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, processId: value }))}
                  disabled={!filters.lineId || filters.lineId === 'all'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="공정 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {filters.lineId &&
                      filters.lineId !== 'all' &&
                      linesData
                        .find((line) => line.id === filters.lineId)
                        ?.processes.map((process) => (
                          <SelectItem key={process.id} value={process.id}>
                            {process.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 불량여부 */}
              <div className="space-y-2">
                <Label>불량여부</Label>
                <Select
                  value={filters.isDefective}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, isDefective: value as any }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="false">정상</SelectItem>
                    <SelectItem value="true">불량</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 직원 검색 */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="employeeSearch">직원 검색</Label>
                <Input
                  id="employeeSearch"
                  placeholder="이름 또는 사번으로 검색"
                  value={filters.employeeSearch}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, employeeSearch: e.target.value }))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Excel 다운로드
          </Button>
          <Button variant="outline" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            초기화
          </Button>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            검색
          </Button>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <CustomDataTable
          id="worklog"
          data={workLogs}
          columns={columns}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          loading={loading}
          searchInput={filters.employeeSearch}
          setPage={setPage}
          setPageSize={setPageSize}
          setSearchInput={(value) => setFilters((prev) => ({ ...prev, employeeSearch: value }))}
          onSearch={handleSearch}
        />
      </div>
    </div>
  )
}

export default DashboardPage
