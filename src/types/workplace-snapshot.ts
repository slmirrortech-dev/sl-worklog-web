import { ShiftType, WorkStatus, WorkerStatus } from '@prisma/client'

// 스냅샷 데이터의 개별 행 (ProcessSlot + 상위 관계 정보)
export type WorkplaceSnapshotRow = {
  반: string // WorkClass.name
  라인: string // FactoryLine.name
  교대조: ShiftType // LineShift.type (DAY/NIGHT)
  라인상태: WorkStatus // LineShift.status (NORMAL/OVERTIME/EXTENDED)
  공정: string // ProcessSlot.name
  작업자: string | null // User.name
  사번: string | null // User.userId
  작업자상태: WorkerStatus | null // ProcessSlot.workerStatus (작업자가 없으면 null)
  // 정렬용 필드 (엑셀 출력에는 사용 안 함)
  라인순서: number // FactoryLine.displayOrder
  공정순서: number // ProcessSlot.slotIndex
}

// API 응답 타입
export type WorkplaceSnapshotResponse = {
  id: string
  recordCount: number // 저장된 데이터 행 수
  createdAt: string
  createdByUserId: string | null
  createdByUserName: string | null // 생성자 이름
  createdByUserUserId: string | null // 생성자 사번
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

// 병합 시 백업일시 정보가 포함된 행
export type WorkplaceSnapshotRowWithBackupTime = WorkplaceSnapshotRow & {
  백업일시: string // 스냅샷 createdAt
}
