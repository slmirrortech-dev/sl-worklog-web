import { UserRequestDto, UserResponseDto } from '@/types/user'
import { apiFetch } from '@/lib/api/api-fetch'
import { ApiResponse } from '@/types/common'

/**
 * 관리자/작업반장 로그인 (사번 기반)
 **/
export async function loginAdminApi(request: UserRequestDto) {
  return apiFetch<UserResponseDto>('/api/auth/login', {
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

/**
 * 비밀번호 변경 (사번과 이름으로 확인) - 초기 비밀번호 변경용
 **/
export async function changePasswordApi(data: {
  userId: string
  name: string
  newPassword: string
}) {
  return apiFetch<ApiResponse<{ success: boolean; message: string }>>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * 비밀번호 업데이트 (현재 비밀번호 확인) - 로그인 후 비밀번호 변경
 **/
export async function updatePasswordApi(data: {
  userId: string
  currentPassword: string
  newPassword: string
}) {
  return apiFetch<ApiResponse<{ success: boolean; message: string }>>('/api/auth/update-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
