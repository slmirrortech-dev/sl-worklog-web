'use client'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { WorkLogResponseModel } from '@/types/work-log'
import { displayMinutes } from '@/lib/utils/time'
import ShiftTypeLabel from '@/components/admin/ShiftTypeLabel'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { WorkLogTable } from '@/app/admin/(main)/work-log/_component/WorkLogTable'
import { useLoading } from '@/contexts/LoadingContext'
import SearchBarWorkLog from '@/app/admin/(main)/work-log/_component/SearchBarWorkLog'
import useSearchWorkLog from '@/app/admin/(main)/work-log/_hooks/useSearchWorkLog'
import { ROUTES } from '@/lib/constants/routes'

const WorkLogPage = () => {
  const { showLoading } = useLoading()
  const router = useRouter()

  // 개별 상태 관리
  const {
    searchStates,
    workLogQuery,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
  } = useSearchWorkLog()

  // 테이블 컬럼 정의
  const columns: ColumnDef<WorkLogResponseModel>[] = [
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
      id: 'lineClassNo',
      header: '반',
      cell: ({ row }) => <div>{row.original.lineClassNo}</div>,
    },
    {
      id: 'lineName',
      header: '라인',
      cell: ({ row }) => <div>{row.original.lineName}</div>,
    },
    {
      id: 'processName',
      header: '공정',
      cell: ({ row }) => <div>{row.original.processName}</div>,
    },
    {
      id: 'userName',
      header: '작업자',
      cell: ({ row }) => (
        <div>
          {row.original.userName} <span className="text-gray-500">({row.original.userUserId})</span>
        </div>
      ),
    },
    {
      id: 'startedAt',
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
      id: 'endedAt',
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
      id: 'durationMinutes',
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
              router.push(`${ROUTES.ADMIN.WORK_LOG}/${row.original.id}`)
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
      <SearchBarWorkLog
        searchStates={searchStates}
        resetFilters={resetFilters}
        workLogData={workLogQuery.data?.data.workLogs || []}
      />

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <WorkLogTable
          id="worklog"
          data={workLogQuery.data?.data.workLogs || []}
          columns={columns}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          loading={workLogQuery.isLoading}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  )
}

export default WorkLogPage
