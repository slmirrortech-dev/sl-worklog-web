'use client'

import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CustomDataGrid } from '@/components/admin/CustomDataGrid'
import useSearchDefectLog from '@/app/admin/(main)/exports/_hooks/useSearchDefectLog'
import SearchBarDefectLog from '@/app/admin/(main)/exports/_component/SearchBarDefectLog'
import { DefectLogResponse } from '@/types/defect-log'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DefectLog = () => {
  // 개별 상태 관리
  const {
    searchStates,
    defectLogQuery,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
  } = useSearchDefectLog()

  // 엑셀 다운로드 처리 (미구현)
  const handleExcelDownload = () => {
    // TODO: 엑셀 다운로드 기능 구현 예정
  }

  // 테이블 컬럼 정의
  const columns: ColumnDef<DefectLogResponse>[] = [
    {
      id: 'occurredAt',
      header: '발생 일시',
      cell: ({ row }) => (
        <div className="text-center">
          {format(new Date(row.original.occurredAt), 'yyyy-MM-dd HH:mm')}
        </div>
      ),
    },
    {
      id: 'workerName',
      header: '작업자',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.workerName}
          <span className="text-xs text-gray-500 ml-1">({row.original.workerUserId})</span>
        </div>
      ),
    },
    {
      id: 'lineName',
      header: '라인명',
      cell: ({ row }) => <div className="text-center">{row.original.lineName}</div>,
    },
    {
      id: 'className',
      header: '반 이름',
      cell: ({ row }) => <div className="text-center">{row.original.className}</div>,
    },
    {
      id: 'shiftType',
      header: '교대조',
      cell: ({ row }) => (
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              row.original.shiftType === 'DAY'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {row.original.shiftType === 'DAY' ? '주간' : '야간'}
          </span>
        </div>
      ),
    },
    {
      id: 'processName',
      header: '공정명',
      cell: ({ row }) => <div className="text-center">{row.original.processName}</div>,
    },
    {
      id: 'memo',
      header: '메모',
      cell: ({ row }) => (
        <div className="text-left max-w-xs truncate" title={row.original.memo}>
          {row.original.memo}
        </div>
      ),
    },
  ]

  return (
    <>
      <section className="flex flex-col space-y-6">
        <SearchBarDefectLog searchStates={searchStates} resetFilters={resetFilters} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <CustomDataGrid
            id="defect-log"
            data={defectLogQuery.data?.data || []}
            columns={columns}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            loading={defectLogQuery.isLoading}
            setPage={setPage}
            setPageSize={setPageSize}
          >
            <Button
              variant="outline"
              className="bg-green-700 text-white hover:bg-green-800 hover:text-white"
              onClick={handleExcelDownload}
              disabled={(defectLogQuery.data?.data || []).length === 0}
            >
              <Download className="w-4 h-4" />
              Excel 다운로드
            </Button>
          </CustomDataGrid>
        </div>
      </section>
    </>
  )
}

export default DefectLog
