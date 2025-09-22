import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'
import {
  addWorkLogRequestModel,
  WorkLogResponseDto,
  endWorkLogRequestModel,
  WorkLogResponseModel,
  getWorkLogRequestModel,
  WorkLogSnapshotResponseModel,
} from '@/types/work-log'

/**
 * 작업 기록 조회
 */
export async function getWorkLogApi({
  startDate = new Date().toISOString().slice(0, 10), // 기본: 오늘 날짜 (YYYY-MM-DD)
  endDate = new Date().toISOString().slice(0, 10), // 기본: 오늘 날짜
  shiftType,
  workStatus,
  lineName,
  classNo,
  processName,
  isDefective,
  searchName,
  skip = 0, // 기본값 0
  take = 50, // 기본값 50
}: getWorkLogRequestModel) {
  const params = new URLSearchParams({
    startDate,
    endDate,
    skip: skip.toString(),
    take: take.toString(),
  })

  if (shiftType) params.append('shiftType', shiftType)
  if (workStatus) params.append('workStatus', workStatus)
  if (lineName) params.append('lineName', lineName)
  if (classNo !== undefined) params.append('classNo', classNo)
  if (processName) params.append('processName', processName)
  if (isDefective !== undefined) params.append('isDefective', String(isDefective))
  if (searchName) params.append('searchName', searchName)

  return await apiFetch<
    ApiResponse<{ workLogs: WorkLogSnapshotResponseModel[]; totalCount: number }>
  >(`/api/work-log?${params.toString()}`)
}

/**
 * 로그인한 작업자의 신규 작업 기록
 */
export async function addWorkLogApi(payload: addWorkLogRequestModel) {
  return await apiFetch<ApiResponse<WorkLogResponseDto>>('/api/work-log', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * 작업 종료
 */
export async function endWorkLogApi(payload: endWorkLogRequestModel) {
  return await apiFetch<ApiResponse<WorkLogResponseDto>>('/api/work-log/end', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * 날짜별 내 작업 기록 조회
 */
export async function getMyDailyWorkLogApi(searchDate: string) {
  return await apiFetch<ApiResponse<WorkLogResponseModel[]>>(`/api/work-log/me?date=${searchDate}`)
}

/**
 * 개별 작업 기록 조회
 */
export async function getWorkLogByIdApi(id: string) {
  return await apiFetch<ApiResponse<WorkLogResponseModel>>(`/api/work-log/${id}`)
}
