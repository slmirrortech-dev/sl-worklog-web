'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CustomDataGrid } from '@/components/admin/CustomDataGrid'
import useSearchWorkplaceLog from '@/app/admin/(main)/exports/_hooks/useSearchWorkplaceLog'
import SearchBarWorkplaceLog from '@/app/admin/(main)/exports/_component/SearchBarWorkplaceLog'
import { WorkplaceSnapshotResponse } from '@/types/workplace-snapshot'
import { format } from 'date-fns'
import ExcelJS from 'exceljs'
import { getMergedSnapshotsApi, getAllSnapshotIdsApi } from '@/lib/api/workplace-api'
import { displayWorkerStatus, displayWorkStatus } from '@/lib/utils/shift-status'
import { Download, Plus, Settings, XIcon, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getBackupSchedulesApi,
  updateBackupSchedulesApi,
} from '@/lib/api/backup-schedule-api'

const WorkplaceLog = () => {
  const queryClient = useQueryClient()

  // 자동 백업 시간 설정 관련 상태
  const [isEditMode, setIsEditMode] = useState(false)
  const [newTime, setNewTime] = useState('')
  const [tempBackupTimes, setTempBackupTimes] = useState<string[]>([])

  // 백업 스케줄 조회
  const schedulesQuery = useQuery({
    queryKey: ['backupSchedules'],
    queryFn: async () => {
      const response = await getBackupSchedulesApi()
      return response.data
    },
  })

  const backupTimes = schedulesQuery.data?.map((s) => s.time) || []

  // 백업 스케줄 업데이트
  const updateSchedulesMutation = useMutation({
    mutationFn: updateBackupSchedulesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupSchedules'] })
    },
  })

  // 체크박스 선택 상태 관리
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 개별 상태 관리
  const {
    searchStates,
    snapshotQuery,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    appliedStartDate,
    appliedEndDate,
  } = useSearchWorkplaceLog()

  // 테이블 컬럼 정의
  const columns: ColumnDef<WorkplaceSnapshotResponse>[] = [
    {
      id: 'createdAtDate',
      header: '백업 날짜',
      cell: ({ row }) => (
        <div className="text-center">{format(row.original.createdAt, 'yyyy-MM-dd')}</div>
      ),
    },
    {
      id: 'createdAtTime',
      header: '백업 시간',
      cell: ({ row }) => (
        <div className="text-center">{format(row.original.createdAt, 'HH:mm')}</div>
      ),
    },
    {
      id: 'createdBy',
      header: '생성자',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.createdByUserName ? (
            <>
              <p>
                {row.original.createdByUserName}{' '}
                <span className="text-gray-500">({row.original.createdByUserUserId})</span>
              </p>
            </>
          ) : (
            <span className="text-blue-600">자동 백업</span>
          )}
        </div>
      ),
    },
  ]

  // 설정 모드 시작
  const handleStartEdit = () => {
    setTempBackupTimes([...backupTimes])
    setIsEditMode(true)
  }

  // 설정 모드 취소
  const handleCancelEdit = () => {
    setTempBackupTimes([])
    setNewTime('')
    setIsEditMode(false)
  }

  // 시간 추가
  const handleAddTime = () => {
    if (!newTime) {
      alert('시간을 입력해주세요.')
      return
    }

    if (tempBackupTimes.includes(newTime)) {
      alert('이미 등록된 시간입니다.')
      return
    }

    setTempBackupTimes([...tempBackupTimes, newTime].sort())
    setNewTime('')
  }

  // 시간 삭제
  const handleRemoveTime = (time: string) => {
    setTempBackupTimes(tempBackupTimes.filter((t) => t !== time))
  }

  // 저장
  const handleSaveBackupTimes = async () => {
    try {
      await updateSchedulesMutation.mutateAsync(tempBackupTimes)
      setTempBackupTimes([])
      setNewTime('')
      setIsEditMode(false)
      alert('백업 시간이 저장되었습니다.')
    } catch (error) {
      console.error('백업 시간 저장 실패:', error)
      alert('백업 시간 저장 중 오류가 발생했습니다.')
    }
  }

  // 전체 선택 핸들러
  const handleSelectAll = async (): Promise<string[]> => {
    try {
      const response = await getAllSnapshotIdsApi({
        startDate: format(appliedStartDate, 'yyyy-MM-dd'),
        endDate: format(appliedEndDate, 'yyyy-MM-dd'),
      })
      return response.data.ids
    } catch (error) {
      console.error('전체 ID 조회 실패:', error)
      alert('전체 선택 중 오류가 발생했습니다.')
      return []
    }
  }

  // 선택된 스냅샷 다운로드 핸들러
  const handleDownloadSelected = async () => {
    if (selectedIds.size === 0) {
      alert('다운로드할 항목을 선택해주세요.')
      return
    }

    try {
      // 선택된 스냅샷 병합 데이터 가져오기
      const response = await getMergedSnapshotsApi(Array.from(selectedIds))
      const mergedData = response.data.data

      if (!mergedData || mergedData.length === 0) {
        alert('다운로드할 데이터가 없습니다.')
        return
      }

      // 엑셀 데이터로 변환 (한글 키를 그대로 사용)
      const excelData = mergedData.map((row) => ({
        백업날짜: format(new Date(row.백업일시), 'yyyy-MM-dd'),
        백업시간: format(new Date(row.백업일시), 'HH:mm'),
        반: `${row.반}반`,
        라인: row.라인,
        교대조: row.교대조 === 'DAY' ? '주간' : '야간',
        라인상태: displayWorkStatus(row.라인상태),
        공정: row.공정,
        작업자: row.작업자 || '-',
        사번: row.사번 || '-',
        작업자상태: row.작업자상태 ? displayWorkerStatus(row.작업자상태) : '-',
      }))

      // 워크북 생성
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('작업장 현황 백업')

      // 헤더 정의
      worksheet.columns = [
        { header: '백업날짜', key: '백업날짜', width: 15 },
        { header: '백업시간', key: '백업시간', width: 12 },
        { header: '반', key: '반', width: 12 },
        { header: '라인', key: '라인', width: 15 },
        { header: '교대조', key: '교대조', width: 12 },
        { header: '라인상태', key: '라인상태', width: 12 },
        { header: '공정', key: '공정', width: 15 },
        { header: '작업자', key: '작업자', width: 12 },
        { header: '사번', key: '사번', width: 12 },
        { header: '작업자상태', key: '작업자상태', width: 12 },
      ]

      // 데이터 추가
      worksheet.addRows(excelData)

      // 파일명 생성
      const currentDate = format(new Date(), 'yyyyMMdd_HHmmss')
      const filename = `작업장현황_병합_${currentDate}.xlsx`

      // 엑셀 파일 다운로드
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)

      alert(`${response.data.snapshotCount}개 스냅샷의 데이터가 다운로드되었습니다.`)

      // 선택 초기화
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Excel download error:', error)
      alert('엑셀 다운로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <section className="flex flex-col space-y-6">
        <div className="space-y-4">
          {/* 자동 백업 시간 설정 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">자동 백업 시간</h2>
                </div>
                {!isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                    className="flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    설정
                  </Button>
                )}
              </div>

              {isEditMode ? (
                // 설정 모드
                <>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* 시간 추가 영역 */}
                    <div className="flex-shrink-0">
                      <Label htmlFor="backup-time" className="text-sm text-gray-700 mb-2 block">
                        백업 시간 추가
                      </Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="backup-time"
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-36 h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTime()
                          }}
                        />
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3"
                          onClick={handleAddTime}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          추가
                        </Button>
                      </div>
                    </div>

                    {/* 등록된 시간 목록 (편집 가능) */}
                    <div className="flex-1">
                      <Label className="text-sm text-gray-700 mb-2 block">백업 시간</Label>
                      <div className="flex flex-wrap items-center gap-2">
                        {tempBackupTimes.map((item) => (
                          <div
                            key={item}
                            className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors group"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTime(item)}
                              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                              aria-label={`${item} 삭제`}
                            >
                              <XIcon className="w-3.5 h-3.5 text-blue-600 group-hover:text-blue-800" />
                            </button>
                          </div>
                        ))}
                        {tempBackupTimes.length === 0 && (
                          <p className="text-sm text-gray-500 py-1">등록된 백업 시간이 없습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-1" />
                      취소
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveBackupTimes}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      저장
                    </Button>
                  </div>
                </>
              ) : (
                // 읽기 모드
                <>
                  <div>
                    {/*<Label className="text-sm text-gray-700 mb-2 block">등록된 백업 시간</Label>*/}
                    <div className="flex flex-wrap items-center gap-2">
                      {backupTimes.map((item) => (
                        <div
                          key={item}
                          className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium"
                        >
                          <span>{item}</span>
                        </div>
                      ))}
                      {backupTimes.length === 0 && (
                        <p className="text-sm text-gray-500 py-1">등록된 백업 시간이 없습니다.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      💡 설정된 시간마다 자동으로 작업장 현황이 백업됩니다.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <SearchBarWorkplaceLog searchStates={searchStates} resetFilters={resetFilters} />
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
              enableSelection={true}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              getRowId={(row) => row.id}
              onSelectAll={handleSelectAll}
            >
              <Button
                variant="outline"
                className="bg-green-700 text-white hover:bg-green-800 hover:text-white"
                onClick={handleDownloadSelected}
                disabled={selectedIds.size <= 0}
              >
                <Download className="w-4 h-4" />
                Excel 다운로드
              </Button>
            </CustomDataGrid>
          </div>
        </div>
      </section>
    </>
  )
}

export default WorkplaceLog
