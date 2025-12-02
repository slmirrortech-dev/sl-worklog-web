import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'
import { WorkClassRequestModel, WorkClassResponseDto } from '@/types/workplace'

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
