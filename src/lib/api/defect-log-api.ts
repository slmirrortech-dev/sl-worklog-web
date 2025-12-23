import { apiFetch } from '@/lib/api/api-fetch'
import { DefectLogCreateRequest, DefectLogResponse } from '@/types/defect-log'
import { ApiResponse } from '@/types/common'
import { ShiftType } from '@prisma/client'

export interface DefectLogSearchParams {
  startDate?: string
  endDate?: string
  workerSearch?: string
  lineName?: string
  className?: string
  processName?: string
  shiftType?: ShiftType
  memo?: string
  page?: number
  pageSize?: number
}

export interface DefectLogSearchResponse {
  data: DefectLogResponse[]
  totalCount: number
  page: number
  pageSize: number
}

/**
 * 불량 유출 이력 검색 (페이징)
 */
export async function searchDefectLogsApi(params: DefectLogSearchParams) {
  const queryParams = new URLSearchParams()

  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.workerSearch) queryParams.append('workerSearch', params.workerSearch)
  if (params.lineName) queryParams.append('lineName', params.lineName)
  if (params.className) queryParams.append('className', params.className)
  if (params.processName) queryParams.append('processName', params.processName)
  if (params.shiftType) queryParams.append('shiftType', params.shiftType)
  if (params.memo) queryParams.append('memo', params.memo)
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())

  const url = `/api/defect-log/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return await apiFetch<ApiResponse<DefectLogSearchResponse>>(url, {
    method: 'GET',
  })
}

/**
 * 특정 작업자 불량 유출 이력 조회
 */
export async function getDefectLogsByWorkerApi(workerId: string) {
  return await apiFetch<ApiResponse<DefectLogResponse[]>>(`/api/defect-log/by-worker/${workerId}`, {
    method: 'GET',
  })
}

/**
 * 특정 불량 유출 이력 삭제
 */
export async function removeDefectLogApi(logId: string) {
  return apiFetch<ApiResponse<string>>(`/api/defect-log/${logId}`, {
    method: 'DELETE',
  })
}

/**
 * 불량 유출 이력 추가
 */
export async function createDefectLogApi(data: DefectLogCreateRequest) {
  return apiFetch<ApiResponse<string>>('/api/defect-log', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 선택된 ID로 불량 유출 이력 조회 (엑셀 다운로드용)
 */
export async function getDefectLogsByIdsApi(ids: string[]) {
  const queryParams = new URLSearchParams()
  queryParams.append('ids', ids.join(','))

  return await apiFetch<ApiResponse<DefectLogResponse[]>>(
    `/api/defect-log?${queryParams.toString()}`,
    {
      method: 'GET',
    },
  )
}

/**
 * 검색 조건에 맞는 모든 불량 유출 이력 ID 조회
 */
export async function getAllDefectLogIdsApi(
  params: Omit<DefectLogSearchParams, 'page' | 'pageSize'>,
) {
  const queryParams = new URLSearchParams()

  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.workerSearch) queryParams.append('workerSearch', params.workerSearch)
  if (params.lineName) queryParams.append('lineName', params.lineName)
  if (params.className) queryParams.append('className', params.className)
  if (params.processName) queryParams.append('processName', params.processName)
  if (params.shiftType) queryParams.append('shiftType', params.shiftType)
  if (params.memo) queryParams.append('memo', params.memo)
  queryParams.append('allIds', 'true')

  return await apiFetch<ApiResponse<{ ids: string[]; totalCount: number }>>(
    `/api/defect-log/search?${queryParams.toString()}`,
    {
      method: 'GET',
    },
  )
}
