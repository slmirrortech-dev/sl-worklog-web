import type { UserDto, UpdateUserDto } from '@/types/dto/user.dto'
import { UserModel } from '@/types/models/user.model'
import { toUserModel } from '@/types/adapter/user.adapter'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/**
 * 특정 사용자 조회하기
 */
export async function getUser(id: string): Promise<UserModel> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message || `Failed to fetch user: ${res.status}`)
  }

  const json: ApiResponse<UserDto> = await res.json()
  return toUserModel(json.data)
}

/**
 * 특정 사용자 수정하기
 */
export async function updateUser(
  id: string,
  updateData: Partial<UpdateUserDto>,
): Promise<UserModel> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updateData),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message || `Failed to update user: ${res.status}`)
  }

  const json: ApiResponse<UserDto> = await res.json()
  return toUserModel(json.data)
}
