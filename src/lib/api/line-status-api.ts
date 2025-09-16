import { ApiResponse } from '@/types/common'
import { apiFetch } from '@/lib/api/api-fetch'
import { ShiftType, WorkStatus } from '@prisma/client'
import { LineResponseDto } from '@/types/line-with-process'

/**
 * 대기열에 작업자 추가
 */
export async function updateLineStatusApi(
  lineId: string,
  shiftType: ShiftType,
  workStatus: WorkStatus,
) {
  return await apiFetch<ApiResponse<LineResponseDto[]>>(`/api/line-status`, {
    method: 'PUT',
    body: JSON.stringify({
      lineId,
      shiftType,
      workStatus,
    }),
  })
}
