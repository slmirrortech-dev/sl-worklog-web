'use client'

import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CustomDataGrid } from '@/components/admin/CustomDataGrid'
import useSearchWorkplaceLog from '@/app/admin/(main)/exports/_hooks/useSearchWorkplaceLog'
import SearchBarWorkplaceLog from '@/app/admin/(main)/exports/_component/SearchBarWorkplaceLog'
import { WorkplaceSnapshotResponse } from '@/types/workplace-snapshot'

const WorkplaceLog = () => {
  // 개별 상태 관리
  const { searchStates, snapshotQuery, resetFilters, page, setPage, pageSize, setPageSize, totalCount } =
    useSearchWorkplaceLog()

  // 테이블 컬럼 정의
  const columns: ColumnDef<WorkplaceSnapshotResponse>[] = [
    {
      id: 'snapshotDate',
      header: '백업 날짜',
      cell: ({ row }) => (
        <div className="text-center">{row.original.snapshotDate}</div>
      ),
    },
    {
      id: 'snapshotTime',
      header: '백업 시간',
      cell: ({ row }) => (
        <div className="text-center font-medium text-blue-600">{row.original.snapshotTime}</div>
      ),
    },
  ]

  return (
    <>
      <section className="flex flex-col space-y-6">
        <SearchBarWorkplaceLog
          searchStates={searchStates}
          resetFilters={resetFilters}
          logData={snapshotQuery.data?.data || []}
        />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <CustomDataGrid
            id="workplace-snapshot"
            data={snapshotQuery.data?.data || []}
            columns={columns}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            loading={snapshotQuery.isLoading}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </div>
      </section>
    </>
  )
}

export default WorkplaceLog
