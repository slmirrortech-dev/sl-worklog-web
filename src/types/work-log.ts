import { Line, Process, ProcessShift, WorkLog } from '@prisma/client'

export type addWorkLogRequestModel = {
  startedAt: Date
  processShiftId: string
}

export type endWorkLogRequestModel = {
  endedAt: Date
  workLogId: string
}

export type WorkLogResponseDto = WorkLog

export type workLogResponseModel = WorkLog & {
  processShift: ProcessShift & {
    process: Process & {
      line: Line
    }
  }
}
