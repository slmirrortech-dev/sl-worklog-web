import { ShiftType } from '@prisma/client'

export type DefectLogResponse = {
  id: string
  occurredAt: string
  workerName: string
  workerUserId: string
  lineName: string
  className: string // 반 이름 (1반, 2반, 서브반 등) - 필수
  shiftType: ShiftType
  processName: string
  memo: string
}

export type DefectLogCreateRequest = {
  occurredAt: string
  workerId: string // user uuid
  lineName: string
  className: string // 반 이름 (필수 입력)
  shiftType: ShiftType
  processName: string
  memo: string
}
