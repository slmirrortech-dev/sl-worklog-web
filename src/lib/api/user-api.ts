import { ApiResponse } from '@/types/common'
import { CurrentUserModel, UserResponseDto } from '@/types/user'
import { apiFetch } from '@/lib/api/api-fetch'

/**
 * 로그인한 사용자 조회하기
 */
export async function getCurrentUserApi() {
  return await apiFetch<ApiResponse<CurrentUserModel>>('/api/users/current-user', {
    method: 'GET',
  })
}

/**
 * 전체 사용자 조회하기
 */
export async function getUsersApi(page: number, pageSize: number, search: string, role: string) {
  return await apiFetch<ApiResponse<UserResponseDto[]>>(
    `/api/users?page=${page}&pageSize=${pageSize}&search=${search}&role=${role}`,
    {
      method: 'GET',
    },
  )
}

/**
 * 특정 사용자 조회하기
 */

/**
 * 특정 사용자 수정하기
 */
