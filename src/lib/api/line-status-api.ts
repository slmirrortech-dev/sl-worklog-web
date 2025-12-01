import { ApiResponse } from '@/types/common'
import { apiFetch } from '@/lib/api/api-fetch'
import { ShiftType, WorkStatus } from '@prisma/client'
import { LineResponseDto } from '@/types/line-with-process'

/**
 * 라인 상태 및 반 정보 업데이트
 */
export async function updateLineStatusApi(
  lineId: string,
  shiftType?: ShiftType,
  workStatus?: WorkStatus,
  classNo?: string,
) {
  return await apiFetch<ApiResponse<LineResponseDto[]>>(`/api/line-status`, {
    method: 'PUT',
    body: JSON.stringify({
      lineId,
      shiftType,
      workStatus,
      classNo,
    }),
  })
}
