import { UserRequestDto, UserResponseDto } from '@/types/user'
import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'

/**
 * 관리자 로그인
 **/
export async function loginAdminApi(request: UserRequestDto) {
  return apiFetch<ApiResponse<UserResponseDto>>('/api/auth/login?role=admin', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * 작업자 로그인
 **/
export async function loginWorkerApi(request: UserRequestDto) {
  return apiFetch<ApiResponse<UserResponseDto>>('/api/auth/login?role=worker', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * 로그아웃
 **/
export async function logoutApi() {
  return apiFetch<ApiResponse<any>>('/api/auth/logout', {
    method: 'POST',
  })
}
