import { apiFetch } from '@/lib/api/api-fetch'
import { TrainingLogCreateRequest, TrainingLogResponse } from '@/types/training-log'
import { ApiResponse } from '@/types/common'

/**
 * 특정 작업자 교육 이력 조회
 */
export async function getTrainingLogsByWorkerApi(workerId: string) {
  return await apiFetch<ApiResponse<TrainingLogResponse[]>>(
    `/api/training-log/by-worker/${workerId}`,
    {
      method: 'GET',
    }
  )
}

/**
 * 특정 교육 이력 삭제
 */
export async function removeTrainingLogApi(logId: string) {
  return apiFetch<ApiResponse<string>>(`/api/training-log/${logId}`, {
    method: 'DELETE',
  })
}

/**
 * 교육 이력 추가
 */
export async function createTrainingLogApi(data: TrainingLogCreateRequest) {
  return apiFetch<ApiResponse<string>>('/api/training-log', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}