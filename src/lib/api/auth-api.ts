import { UserLoginRequestDto, UserLoginResponseDto } from '@/types/user'
import { apiFetch } from '@/lib/api/api-fetch'

/**
 * 관리자 로그인
 **/
export async function loginAdminApi(request: UserLoginRequestDto) {
  return apiFetch<UserLoginResponseDto>('/api/auth/login?role=admin', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * 작업자 로그인
 **/
export async function loginWorkerApi(request: UserLoginRequestDto) {
  return apiFetch<UserLoginResponseDto>('/api/auth/login?role=worker', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

/**
 * 로그아웃
 **/
export async function logoutApi() {
  return apiFetch<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
  })
}
