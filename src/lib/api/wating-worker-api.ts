import { ApiResponse } from '@/types/common'
import { apiFetch } from '@/lib/api/api-fetch'
import { ShiftType } from '@prisma/client'
import { LineResponseDto } from '@/types/line-with-process'

/**
 * 대기열에 작업자 추가
 */
export async function addWaitingWorKerApi(
  processId: string,
  shiftType: ShiftType,
  usersUuid: string,
) {
  return await apiFetch<
    ApiResponse<{
      added: any
      updated: LineResponseDto[]
    }>
  >(`/api/waiting-worker`, {
    method: 'POST',
    body: JSON.stringify({
      processId,
      shiftType,
      usersUuid,
    }),
  })
}

/**
 * 대기열에 작업자 삭제
 */
export async function deleteWaitingWorKerApi(processId: string, shiftType: ShiftType) {
  return await apiFetch<
    ApiResponse<{
      deleted: any
      updated: LineResponseDto[]
    }>
  >(`/api/waiting-worker?processId=${processId}&shiftType=${shiftType}`, {
    method: 'DELETE',
  })
}
