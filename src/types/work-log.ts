import { WorkLog } from '@prisma/client'

export type addWorkLogRequestModel = {
  startedAt: Date
  processShiftId: string
}

export type addWorkLogResponseModel = WorkLog
