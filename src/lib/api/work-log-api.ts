import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'
import { addWorkLogRequestModel, addWorkLogResponseModel } from '@/types/work-log'

/**
 * 로그인한 작업자의 신규 작업 기록
 */
export async function addWorkLogApi(payload: addWorkLogRequestModel) {
  return await apiFetch<ApiResponse<addWorkLogResponseModel>>('/api/work-log', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
