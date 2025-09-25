import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'
import { LineResponseDto } from '@/types/line-with-process'

/**
 * 라인 프로세스 통합 조회
 **/
export async function getLineWithProcess() {
  return apiFetch<ApiResponse<LineResponseDto[]>>('/api/line-with-process', {
    method: 'GET',
  })
}

/**
 * 모니터용 - 라인 프로세스 통합 조회
 **/
export async function getMonitorLineWithProcessApi() {
  return apiFetch<ApiResponse<LineResponseDto[]>>('/api/monitor/line-with-process', {
    method: 'GET',
  })
}

/**
 * 라인 프로세스 통합 업데이트
 **/
export async function updateLineWithProcess(lineWithProcess: LineResponseDto[]) {
  return apiFetch<ApiResponse<LineResponseDto[]>>('/api/line-with-process', {
    method: 'POST',
    body: JSON.stringify({ lineWithProcess }),
  })
}
