import { User } from '@prisma/client'

// 로그인 요청 DTO (관리자/작업반장 - 사번 기반)
export type UserRequestDto = {
  userId: string // 사번
  password: string
}

// 로그인 응답 DTO (supabaseUserId 제외)
export type UserResponseDto = Omit<User, 'supabaseUserId'>

// 로그인한 사용자 정보
export type CurrentUserModel = Pick<
  User,
  'id' | 'userId' | 'name' | 'hireDate' | 'role' | 'licensePhotoUrl' | 'createdAt'
>

export type updateUserRequestModel = Pick<User, 'name' | 'role' | 'isActive' | 'licensePhotoUrl' | 'hireDate'>
