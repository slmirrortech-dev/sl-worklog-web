'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CustomDataGrid } from '@/components/admin/CustomDataGrid'
import useSearchDefectLog from '@/app/admin/(main)/exports/_hooks/useSearchDefectLog'
import SearchBarDefectLog from '@/app/admin/(main)/exports/_component/SearchBarDefectLog'
import { DefectLogResponse } from '@/types/defect-log'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShiftTypeLabel from '@/components/admin/ShiftTypeLabel'
import ExcelJS from 'exceljs'
import { getDefectLogsByIdsApi, getAllDefectLogIdsApi } from '@/lib/api/defect-log-api'
import useDialogStore from '@/store/useDialogStore'

const DefectLog = () => {
  const { showDialog } = useDialogStore()

  // 체크박스 선택 상태 관리
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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
    appliedFilters,
  } = useSearchDefectLog()

  // 전체 선택 핸들러
  const handleSelectAll = async (): Promise<string[]> => {
    try {
      const response = await getAllDefectLogIdsApi(appliedFilters)
      return response.data.ids
    } catch (error) {
      console.error('전체 ID 조회 실패:', error)
      showDialog({
        type: 'error',
        title: '전체 선택 실패',
        description: '전체 선택 중 오류가 발생했습니다.',
        confirmText: '확인',
      })
      return []
    }
  }

  // 선택된 불량 로그 다운로드 핸들러
  const handleExcelDownload = async () => {
    if (selectedIds.size === 0) {
      showDialog({
        type: 'warning',
        title: '선택 필요',
        description: '다운로드할 항목을 선택해주세요.',
        confirmText: '확인',
      })
      return
    }

    try {
      // 선택된 불량 로그 데이터 가져오기
      const response = await getDefectLogsByIdsApi(Array.from(selectedIds))
      const defectLogs = response.data

      if (!defectLogs || defectLogs.length === 0) {
        showDialog({
          type: 'warning',
          title: '데이터 없음',
          description: '다운로드할 데이터가 없습니다.',
          confirmText: '확인',
        })
        return
      }

      // 엑셀 데이터로 변환
      const excelData = defectLogs.map((log) => ({
        발생일시: format(new Date(log.occurredAt), 'yyyy-MM-dd HH:mm'),
        작업자: log.workerName,
        사번: log.workerUserId,
        라인명: log.lineName,
        반이름: log.className,
        교대조: log.shiftType === 'DAY' ? '주간' : '야간',
        공정명: log.processName,
        메모: log.memo || '-',
      }))

      // 워크북 생성
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('불량 유출 기록')

      // 헤더 정의
      worksheet.columns = [
        { header: '발생일시', key: '발생일시', width: 20 },
        { header: '작업자', key: '작업자', width: 15 },
        { header: '사번', key: '사번', width: 15 },
        { header: '라인명', key: '라인명', width: 15 },
        { header: '반이름', key: '반이름', width: 12 },
        { header: '교대조', key: '교대조', width: 12 },
        { header: '공정명', key: '공정명', width: 15 },
        { header: '메모', key: '메모', width: 30 },
      ]

      // 데이터 추가
      worksheet.addRows(excelData)

      // 헤더 스타일 적용
      worksheet.getRow(1).font = { bold: true }
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      }

      // 모든 셀 가운데 정렬
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = { vertical: 'middle', horizontal: 'center' }
        }
      })

      // 파일 다운로드
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `불량유출기록_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)

      showDialog({
        type: 'success',
        title: '다운로드 완료',
        description: `${defectLogs.length}건의 불량 유출 기록이 다운로드되었습니다.`,
        confirmText: '확인',
      })
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error)
      showDialog({
        type: 'error',
        title: '다운로드 실패',
        description: '엑셀 다운로드 중 오류가 발생했습니다.',
        confirmText: '확인',
      })
    }
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
          <span className="text-sm text-gray-500 ml-1">({row.original.workerUserId})</span>
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
          <ShiftTypeLabel shiftType={row.original.shiftType} size={'sm'} />
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
        <div className="text-center max-w-xs truncate" title={row.original.memo}>
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
            enableSelection={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            getRowId={(row) => row.id}
            onSelectAll={handleSelectAll}
          >
            <Button
              variant="outline"
              className="bg-green-700 text-white hover:bg-green-800 hover:text-white"
              onClick={handleExcelDownload}
              disabled={selectedIds.size === 0}
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
