import { User, Line, Process, ProcessShift } from '@prisma/client'

export type waitingWorkerModel = Pick<User, 'id' | 'userId' | 'name' | 'licensePhotoUrl'>

// 교대조 DTO
export type ProcessShiftDto = ProcessShift & {
  waitingWorker: waitingWorkerModel | null
}

// 공정 DTO (DB 기본 필드 + 하위 교대조 포함)
export type ProcessResponseDto = Process & {
  shifts: ProcessShiftDto[]
}

// 라인 DTO (DB 기본 필드 + 하위 공정 포함)
export type LineResponseDto = Line & {
  processes: ProcessResponseDto[]
}
