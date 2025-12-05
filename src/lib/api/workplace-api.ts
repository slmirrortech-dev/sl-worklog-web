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
  return apiFetch<ApiResponse<{}>>('/api/factory-line', {
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
  return apiFetch<ApiResponse<{}>>('/api/shift-status', {
    method: 'PUT',
    body: JSON.stringify({ shiftId, status }),
  })
}
