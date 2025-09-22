'use client'
import React, { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RotateCcw, Download, ChevronRight } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getWorkLogApi } from '@/lib/api/work-log-api'
import { getWorkLogRequestModel, WorkLogSnapshotResponseModel } from '@/types/work-log'
import { ShiftType, WorkStatus } from '@prisma/client'
import { displayMinutes } from '@/lib/utils/time'
import ShiftTypeLabel from '@/components/admin/ShiftTypeLabel'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { WorkLogTable } from '@/components/WorkLogTable'

const WorkLogPage = () => {
  const router = useRouter()

  // 개별 상태 관리
  const [startDate, setStartDate] = useState(() => format(subDays(new Date(), 7), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [shiftType, setShiftType] = useState<ShiftType | 'ALL'>('ALL')
  const [workStatus, setWorkStatus] = useState<WorkStatus | 'ALL'>('ALL')
  const [lineName, setLineName] = useState('')
  const [classNo, setClassNo] = useState('')
  const [processName, setProcessName] = useState('')
  const [searchName, setSearchName] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // TanStack Query로 데이터 가져오기
  const { data, isLoading } = useQuery({
    queryKey: [
      'workLogs',
      page,
      pageSize,
      startDate,
      endDate,
      shiftType,
      workStatus,
      lineName,
      classNo,
      processName,
      searchName,
    ],
    queryFn: () =>
      getWorkLogApi({
        startDate,
        endDate,
        shiftType: shiftType === 'ALL' ? undefined : shiftType,
        workStatus: workStatus === 'ALL' ? undefined : workStatus,
        lineName: lineName || undefined,
        classNo: classNo || undefined,
        processName: processName || undefined,
        searchName: searchName || undefined,
        skip: (page - 1) * pageSize,
        take: pageSize,
      } as getWorkLogRequestModel),
  })

  // 필터 초기화
  const resetFilters = () => {
    setStartDate(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
    setEndDate(new Date().toISOString().slice(0, 10))
    setShiftType('ALL')
    setWorkStatus('ALL')
    setLineName('')
    setClassNo('')
    setProcessName('')
    setSearchName('')
    setPage(1)
  }

  useEffect(() => {
    if (data) {
      console.log(data.data.workLogs)
    }
  }, [data])

  // 테이블 컬럼 정의
  const columns: ColumnDef<WorkLogSnapshotResponseModel>[] = [
    {
      id: 'shiftType',
      header: '시간대',
      cell: ({ row }) => {
        return <ShiftTypeLabel shiftType={row.original.shiftType} size={'sm'} />
      },
    },
    {
      id: 'workStatus',
      header: '상태',
      cell: ({ row }) => {
        return <ShiftStatusLabel status={row.original.workStatus} size={'sm'} />
      },
    },
    {
      accessorKey: 'processShift.process.line.name',
      header: '라인',
      cell: ({ row }) => (
        <div>
          {row.original.lineName} ({row.original.lineClassNo}반)
        </div>
      ),
    },
    {
      accessorKey: 'processShift.process.name',
      header: '공정',
      cell: ({ row }) => <div>{row.original.processName}</div>,
    },
    {
      accessorKey: 'user.name',
      header: '작업자',
      cell: ({ row }) => (
        <div>
          {row.original.userName}
          <br />({row.original.userUserId})
        </div>
      ),
    },
    {
      accessorKey: 'startedAt',
      header: '시작 시간',
      cell: ({ row }) => (
        <div>
          {format(row.original.startedAt, 'yyyy-MM-dd', { locale: ko })}
          <br />
          {format(row.original.startedAt, 'HH:mm', { locale: ko })}
        </div>
      ),
    },
    {
      accessorKey: 'endedAt',
      header: '종료 시간',
      cell: ({ row }) => (
        <div>
          {row.original.endedAt ? (
            <>
              {format(row.original.endedAt, 'yyyy-MM-dd', { locale: ko })}
              <br />
              {format(row.original.endedAt, 'HH:mm', { locale: ko })}
            </>
          ) : (
            '진행중'
          )}
        </div>
      ),
    },
    {
      accessorKey: 'durationMinutes',
      header: '작업 시간',
      cell: ({ row }) => {
        return <div>{displayMinutes(row.original.durationMinutes || 0)}</div>
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center font-semibold text-gray-700 text-base"></div>,
      cell: ({ row }) => (
        <div>
          <Button
            variant="outline"
            size="default"
            onClick={() => router.push(`/admin/work-log/${row.original.id}`)}
          >
            상세 보기
            <ChevronRight className="w-3 h-3 -ml-1" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col space-y-6">
      {/* 검색 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 시작일 */}
          <div className="space-y-2">
            <Label htmlFor="startDate">시작일</Label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 종료일 */}
          <div className="space-y-2">
            <Label htmlFor="endDate">종료일</Label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 근무형태 */}
          <div className="space-y-2">
            <Label>근무형태</Label>
            <Select
              value={shiftType}
              onValueChange={(value) => setShiftType(value as ShiftType | 'ALL')}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="DAY">주간</SelectItem>
                <SelectItem value="NIGHT">야간</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 작업상태 */}
          <div className="space-y-2">
            <Label>작업상태</Label>
            <Select
              value={workStatus}
              onValueChange={(value) => setWorkStatus(value as WorkStatus | 'ALL')}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="IN_PROGRESS">진행중</SelectItem>
                <SelectItem value="COMPLETED">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 라인명 */}
          <div className="space-y-2">
            <Label htmlFor="lineName">라인명</Label>
            <Input
              id="lineName"
              placeholder="라인명 검색"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
            />
          </div>

          {/* 반번호 */}
          <div className="space-y-2">
            <Label htmlFor="classNo">반번호</Label>
            <Input
              id="classNo"
              placeholder="반번호 검색"
              value={classNo}
              onChange={(e) => setClassNo(e.target.value)}
            />
          </div>

          {/* 공정명 */}
          <div className="space-y-2">
            <Label htmlFor="processName">공정명</Label>
            <Input
              id="processName"
              placeholder="공정명 검색"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
            />
          </div>
        </div>

        {/* 직원 검색 */}
        <div className="mt-4">
          <Label htmlFor="searchName">직원 검색</Label>
          <Input
            id="searchName"
            placeholder="이름 또는 사번으로 검색"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="mt-2"
          />
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
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <WorkLogTable
          id="worklog"
          data={data?.data.workLogs || []}
          columns={columns}
          page={page}
          pageSize={pageSize}
          totalCount={data?.data.totalCount || 0}
          totalPages={Math.ceil((data?.data.totalCount || 0) / pageSize)}
          loading={isLoading}
          searchInput=""
          setPage={setPage}
          setPageSize={setPageSize}
          setSearchInput={() => {}}
          onSearch={() => {}}
        />
      </div>
    </div>
  )
}

export default WorkLogPage
