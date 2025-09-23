'use client'
import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { WorkLogSnapshotResponseModel } from '@/types/work-log'
import { displayMinutes } from '@/lib/utils/time'
import ShiftTypeLabel from '@/components/admin/ShiftTypeLabel'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { WorkLogTable } from '@/app/admin/(main)/work-log/_component/WorkLogTable'
import { useLoading } from '@/contexts/LoadingContext'
import SearchBarWorkLog from '@/app/admin/(main)/work-log/_component/SearchBarWorkLog'
import useSearchWorkLog from '@/app/admin/(main)/work-log/_hooks/useSearchWorkLog'

const WorkLogPage = () => {
  const { showLoading } = useLoading()
  const router = useRouter()

  // 개별 상태 관리
  const { searchStates, workLogQuery, resetFilters } = useSearchWorkLog()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

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
      accessorKey: 'processShift.process.line.classNo',
      header: '반',
      cell: ({ row }) => <div>{row.original.lineClassNo}</div>,
    },
    {
      accessorKey: 'processShift.process.line.name',
      header: '라인',
      cell: ({ row }) => <div>{row.original.lineName}</div>,
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
            '진행 중'
          )}
        </div>
      ),
    },
    {
      accessorKey: 'durationMinutes',
      header: '작업 시간',
      cell: ({ row }) => {
        return (
          <div>{row.original.endedAt ? displayMinutes(row.original.durationMinutes) : '-'}</div>
        )
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
            onClick={() => {
              showLoading()
              router.push(`/admin/work-log/${row.original.id}`)
            }}
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
      <SearchBarWorkLog searchStates={searchStates} resetFilters={resetFilters} />

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <WorkLogTable
          id="worklog"
          data={workLogQuery.data?.data.workLogs || []}
          columns={columns}
          page={page}
          pageSize={pageSize}
          totalCount={workLogQuery.data?.data.totalCount || 0}
          totalPages={Math.ceil((workLogQuery.data?.data.totalCount || 0) / pageSize)}
          loading={workLogQuery.isLoading}
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
