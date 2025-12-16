import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'
import { WorkStatus } from '@prisma/client'
import {
  FactoryConfigRequest,
  FactoryConfigResponse,
  FactoryLineRequest,
  FactoryLineResponse,
  WorkClassRequestModel,
  WorkClassResponseDto,
} from '@/types/workplace'
import {
  WorkplaceSnapshotResponse,
  WorkplaceSnapshotRowWithBackupTime,
} from '@/types/workplace-snapshot'

/**
 * 반 가져오기
 **/
export async function getWorkClassesApi() {
  return apiFetch<ApiResponse<WorkClassResponseDto[]>>('/api/work-classes', {
    method: 'GET',
  })
}

/**
 * 반 수정하기
 **/
export async function updateWorkClassApi(items: WorkClassRequestModel[]) {
  return apiFetch<ApiResponse<WorkClassResponseDto[]>>('/api/work-classes', {
    method: 'PUT',
    body: JSON.stringify(items),
  })
}

/**
 * 공장 기본 설정 가져오기
 **/
export async function getFactoryConfigApi() {
  return apiFetch<ApiResponse<FactoryConfigResponse>>('/api/factory-config', {
    method: 'GET',
  })
}

/**
 * 공장 기본 설정 수정하기
 **/
export async function updateFactoryConfigApi({ processCount }: FactoryConfigRequest) {
  return apiFetch<ApiResponse<FactoryConfigResponse>>('/api/factory-config', {
    method: 'PUT',
    body: JSON.stringify({ processCount }),
  })
}

/**
 * 라인 가져오기
 **/
export async function getFactoryLineApi() {
  return apiFetch<ApiResponse<FactoryLineResponse[]>>('/api/factory-line', {
    method: 'GET',
  })
}

/**
 * 라인 수정하기
 **/
export async function updateFactoryLineApi(lines: FactoryLineRequest[]) {
  return apiFetch<ApiResponse<Record<string, never>>>('/api/factory-line', {
    method: 'PUT',
    body: JSON.stringify(lines),
  })
}

/**
 * 라인 전체 가져오기
 **/
export async function getAllFactoryLineApi() {
  return apiFetch<ApiResponse<FactoryLineResponse[]>>('/api/factory-line/all', {
    method: 'GET',
  })
}

/**
 * 교대조 상태 변경하기
 **/
export async function updateShiftStatusApi(shiftId: string, status: WorkStatus) {
  return apiFetch<ApiResponse<Record<string, never>>>('/api/shift-status', {
    method: 'PUT',
    body: JSON.stringify({ shiftId, status }),
  })
}

/**
 * 작업장 현황 스냅샷 생성
 **/
export async function createWorkplaceSnapshotApi() {
  return apiFetch<ApiResponse<WorkplaceSnapshotResponse>>('/api/workplace-snapshot', {
    method: 'POST',
  })
}

/**
 * 선택된 스냅샷들을 병합하여 데이터 반환
 **/
export async function getMergedSnapshotsApi(snapshotIds: string[]) {
  const idsParam = snapshotIds.join(',')
  return apiFetch<
    ApiResponse<{
      data: WorkplaceSnapshotRowWithBackupTime[]
      snapshotCount: number
      totalRecords: number
    }>
  >(`/api/workplace-snapshot/merge?ids=${idsParam}`, {
    method: 'GET',
  })
}

/**
 * 검색 조건에 해당하는 모든 스냅샷 ID 목록 조회
 **/
export async function getAllSnapshotIdsApi(params: { startDate?: string; endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params.startDate) searchParams.set('startDate', params.startDate)
  if (params.endDate) searchParams.set('endDate', params.endDate)

  const queryString = searchParams.toString()
  const url = queryString
    ? `/api/workplace-snapshot/ids?${queryString}`
    : '/api/workplace-snapshot/ids'

  return apiFetch<ApiResponse<{ ids: string[]; totalCount: number }>>(url, {
    method: 'GET',
  })
}
