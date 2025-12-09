import { apiFetch } from '@/lib/api/api-fetch'
import { DefectLogResponse } from '@/types/defect-log'
import { ApiResponse } from '@/types/common'

/**
 * 특정 작업자 불량 유출 이력 조회
 */
export async function getDefectLogsByWorkerApi(workerId: string) {
  return await apiFetch<ApiResponse<DefectLogResponse[]>>(`/api/defect-log/${workerId}`, {
    method: 'GET',
  })
}
