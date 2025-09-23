import { Line, Process, ProcessShift, ShiftType, WorkLog, WorkStatus } from '@prisma/client'

export type addWorkLogRequestModel = {
  startedAt: Date
  processShiftId: string
}

export type endWorkLogRequestModel = {
  endedAt: Date
  workLogId: string
}

export type WorkLogResponseDto = WorkLog

// 작업자 화면에서 사용
export type WorkLogResponseModel = WorkLog & {
  processShift: ProcessShift & {
    process: Process & {
      line: Line
    }
  }
}

// 관리자 화면에서 사용
export type WorkLogSnapshotResponseModel = {
  id: string
  userUserId: string
  userName: string
  startedAt: Date
  endedAt: Date
  durationMinutes: number
  isDefective: boolean
  processName: string
  lineName: string
  lineClassNo: number
  shiftType: ShiftType
  workStatus: WorkStatus
  histories: any // TODO: 미정
}

export type getWorkLogRequestModel = {
  startDate: Date
  endDate: Date
  shiftType?: ShiftType
  workStatus?: WorkStatus
  lineName?: string
  lineClassNo?: string
  processName?: string
  isDefective?: boolean
  searchName?: string
  progress?: 'END' | 'NOT_END'
  skip: number
  take: number
}
