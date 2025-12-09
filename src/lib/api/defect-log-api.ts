import { apiFetch } from '@/lib/api/api-fetch'
import { DefectLogCreateRequest, DefectLogResponse } from '@/types/defect-log'
import { ApiResponse } from '@/types/common'

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
