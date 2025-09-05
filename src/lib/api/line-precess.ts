import { LineModel } from '@/types/models/lineProcess.model'
import { ApiResponse } from '@/types'
import { toLineProcessModel } from '@/types/adapter/lineProcess.adapter'
import { LineResponseDto, SaveLineDto } from '@/types/dto/lineProcess.dto'

/**
 * 라인+공정 통합 조회하기
 */
export async function getLineProcess(): Promise<LineModel[]> {
  const res = await fetch('/api/line-process?isActive=true', {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => {})
    throw new Error(error?.message || `Failed to fetch user: ${res.status}`)
  }

  const json: ApiResponse<LineResponseDto[]> = await res.json()
  return json.data.map((dto) => toLineProcessModel(dto))
}

/**
 * 라인+공정 통합 업데이트
 */
export async function updateLineProcess(updateData: SaveLineDto): Promise<LineResponseDto[]> {
  const res = await fetch(`/api/line-process`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updateData),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message || `Failed to update user: ${res.status}`)
  }

  const json: ApiResponse<LineResponseDto[]> = await res.json()
  return json.data
}
