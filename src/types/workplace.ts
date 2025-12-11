import { ShiftType, WorkClass, WorkStatus, WorkerStatus } from '@prisma/client'

export type WorkClassResponseDto = WorkClass

export type WorkClassRequestModel = WorkClass

export type WorkClassResponse = {
  id: string
  name: string
  displayOrder: number
}

export type FactoryConfigRequest = {
  processCount: number
}

export type FactoryConfigResponse = {
  id: string
  processCount: number
}

export type FactoryLineResponse = {
  id: string
  displayOrder: number
  name: string
  workClassId: string
  shifts?: LineShiftResponse[]
}

export type FactoryLineRequest = {
  id: string
  displayOrder: number
  name: string
  workClassId: string
}

export type LineShiftResponse = {
  id: string
  lineId: string
  status: WorkStatus
  type: ShiftType
  slots: ProcessSlot[]
}

export type ProcessSlot = {
  id: string
  name: string
  shiftId: string
  slotIndex: number
  workerId: string
  workerStatus: WorkerStatus
  worker: {
    id: string
    name: string
    userId: string
    licensePhotoUrl: string | null
  } | null
}
