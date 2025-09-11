import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'

/**
 * 라인 프로세스 통합 조회
 **/
export async function getLineWithProcess() {
  return apiFetch<ApiResponse<any>>('/api/line-with-process', {
    method: 'GET',
  })
}
