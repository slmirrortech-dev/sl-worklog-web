import { ShiftType } from '@prisma/client'

export type DefectLogResponse = {
  id: string
  occurredAt: string
  workerName: string
  workerUserId: string
  lineName: string
  shiftType: ShiftType
  processName: string
  memo: string
}

export type DefectLogCreateRequest = {
  occurredAt: string
  workerId: string // user uuid
  lineName: string
  shiftType: ShiftType
  processName: string
  memo: string
}
