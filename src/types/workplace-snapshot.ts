import { ShiftType, WorkStatus } from '@prisma/client'

// 스냅샷 데이터의 개별 행 (ProcessSlot + 상위 관계 정보)
export type WorkplaceSnapshotRow = {
  반이름: string // WorkClass.name
  라인이름: string // FactoryLine.name
  공정이름: string // ProcessSlot.name
  교대조타입: ShiftType // LineShift.type (DAY/NIGHT)
  라인상태: WorkStatus // LineShift.status (NORMAL/OVERTIME/EXTENDED)
  작업자이름: string | null // User.name
  사번: string | null // User.userId
  작업자상태: WorkStatus // ProcessSlot.workerStatus (NORMAL/OVERTIME/EXTENDED)
}

// API 응답 타입
export type WorkplaceSnapshotResponse = {
  id: string
  snapshotDate: string // yyyy-MM-dd
  snapshotTime: string // HH:mm
  recordCount: number // 저장된 데이터 행 수
  createdAt: string
  createdBy: string | null
}

// 스냅샷 생성 요청 (API에서 자동으로 현재 작업장 현황을 캡처)
export type WorkplaceSnapshotCreateRequest = {
  snapshotDate: string // yyyy-MM-dd
  snapshotTime: string // HH:mm
  createdBy?: string | null
}

// 스냅샷 검색 파라미터
export type WorkplaceSnapshotSearchParams = {
  startDate?: string // yyyy-MM-dd
  endDate?: string // yyyy-MM-dd
  page?: number
  pageSize?: number
}

// 스냅샷 검색 응답 (페이징)
export type WorkplaceSnapshotSearchResponse = {
  data: WorkplaceSnapshotResponse[]
  totalCount: number
  page: number
  pageSize: number
}

// 엑셀 다운로드용 - 스냅샷의 전체 데이터 포함
export type WorkplaceSnapshotDetailResponse = WorkplaceSnapshotResponse & {
  data: WorkplaceSnapshotRow[] // 전체 작업장 현황 데이터
}
