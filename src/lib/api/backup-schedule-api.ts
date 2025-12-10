import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'

export type BackupSchedule = {
  id: string
  time: string // HH:mm 형식
}

/**
 * 백업 스케줄 목록 조회
 */
export async function getBackupSchedulesApi() {
  return apiFetch<ApiResponse<BackupSchedule[]>>('/api/backup-schedule', {
    method: 'GET',
  })
}

/**
 * 백업 스케줄 업데이트
 */
export async function updateBackupSchedulesApi(times: string[]) {
  return apiFetch<ApiResponse<BackupSchedule[]>>('/api/backup-schedule', {
    method: 'PUT',
    body: JSON.stringify({ times }),
  })
}
