import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'
import { ShiftType } from '@prisma/client'
import { FactoryLineResponse, ProcessSlot } from '@/types/workplace'

/**
 * ProcessSlot에 작업자 추가
 */
export async function addWorkerToSlotApi(
  lineId: string,
  shiftType: ShiftType,
  slotIndex: number,
  workerId: string,
  force?: boolean,
) {
  return apiFetch<
    ApiResponse<{
      slot: ProcessSlot
      allLines: FactoryLineResponse[]
    }>
  >('/api/process-slot', {
    method: 'POST',
    body: JSON.stringify({
      lineId,
      shiftType,
      slotIndex,
      workerId,
      force,
    }),
  })
}

/**
 * ProcessSlot에서 작업자 제거
 */
export async function removeWorkerFromSlotApi(
  lineId: string,
  shiftType: ShiftType,
  slotIndex: number,
) {
  return apiFetch<
    ApiResponse<{
      slot: ProcessSlot
      allLines: FactoryLineResponse[]
    }>
  >(`/api/process-slot?lineId=${lineId}&shiftType=${shiftType}&slotIndex=${slotIndex}`, {
    method: 'DELETE',
  })
}

/**
 * ProcessSlot의 작업자 상태(workerStatus) 업데이트
 */
export async function updateWorkerStatusApi(
  lineId: string,
  shiftType: ShiftType,
  slotIndex: number,
  workerStatus: 'NORMAL' | 'OVERTIME',
) {
  return apiFetch<
    ApiResponse<{
      slot: ProcessSlot
      allLines: FactoryLineResponse[]
    }>
  >('/api/process-slot', {
    method: 'PATCH',
    body: JSON.stringify({
      lineId,
      shiftType,
      slotIndex,
      workerStatus,
    }),
  })
}
