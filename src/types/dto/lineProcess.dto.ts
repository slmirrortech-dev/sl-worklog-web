// 요청용 공정 DTO
export interface ProcessRequestDto {
  id?: string // 없으면 새로 생성, 있으면 수정
  name: string
  order: number
  isActive?: boolean // 활성/비활성 전환 지원
}

// 요청용 라인 DTO
export interface LineRequestDto {
  id?: string
  name: string
  order: number
  processes: ProcessRequestDto[] // 포함된 공정들
  isActive?: boolean // 활성/비활성 전환 지원
}

// 요청 전체 (등록/수정/비활성화 통합)
export type SaveLineDto = LineRequestDto[]

// 응답용 공정 DTO
export interface ProcessResponseDto {
  id: string
  name: string
  order: number
  lineId: string
  createdAt: Date
  isActive: boolean // 비활성 여부
  deactivatedAt?: Date | null // 비활성화된 시점 (활성 상태면 null/undefined)
}

// 응답용 라인 DTO
export interface LineResponseDto {
  id: string
  name: string
  order: number
  processes: ProcessResponseDto[]
  createdAt: Date
  isActive: boolean
  deactivatedAt?: Date | null
}
