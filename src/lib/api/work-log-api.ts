import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'
import {
  addWorkLogRequestModel,
  WorkLogResponseDto,
  endWorkLogRequestModel,
  workLogResponseModel,
} from '@/types/work-log'

/**
 * 로그인한 작업자의 신규 작업 기록
 */
export async function addWorkLogApi(payload: addWorkLogRequestModel) {
  return await apiFetch<ApiResponse<WorkLogResponseDto>>('/api/work-log', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * 작업 종료
 */
export async function endWorkLogApi(payload: endWorkLogRequestModel) {
  return await apiFetch<ApiResponse<WorkLogResponseDto>>('/api/work-log/end', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * 날짜별 내 작업 기록 조회
 */
export async function getMyDailyWorkLogApi(searchDate: string) {
  return await apiFetch<ApiResponse<workLogResponseModel[]>>(`/api/work-log/me?date=${searchDate}`)
}
