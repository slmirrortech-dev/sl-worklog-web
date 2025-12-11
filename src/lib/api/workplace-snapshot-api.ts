import { apiFetch } from '@/lib/api/api-fetch'
import {
  WorkplaceSnapshotCreateRequest,
  WorkplaceSnapshotDetailResponse,
  WorkplaceSnapshotSearchParams,
  WorkplaceSnapshotSearchResponse,
} from '@/types/workplace-snapshot'
import { ApiResponse } from '@/types/common'

/**
 * 작업장 현황 스냅샷 목록 조회 (페이징)
 */
export async function searchWorkplaceSnapshotsApi(params: WorkplaceSnapshotSearchParams) {
  const queryParams = new URLSearchParams()

  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())

  const url = `/api/workplace-snapshot${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return await apiFetch<ApiResponse<WorkplaceSnapshotSearchResponse>>(url, {
    method: 'GET',
  })
}

/**
 * 특정 스냅샷 상세 조회 (엑셀 다운로드용)
 */
export async function getWorkplaceSnapshotDetailApi(snapshotId: string) {
  return await apiFetch<ApiResponse<WorkplaceSnapshotDetailResponse>>(
    `/api/workplace-snapshot/${snapshotId}`,
    {
      method: 'GET',
    },
  )
}

/**
 * 작업장 현황 스냅샷 생성
 * 현재 작업장 현황을 자동으로 캡처하여 저장
 */
export async function createWorkplaceSnapshotApi(data: WorkplaceSnapshotCreateRequest) {
  return await apiFetch<ApiResponse<WorkplaceSnapshotDetailResponse>>(
    '/api/workplace-snapshot',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )
}
