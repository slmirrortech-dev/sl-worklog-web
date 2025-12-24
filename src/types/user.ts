import { User } from '@prisma/client'

// 로그인 요청 DTO (관리자/작업반장 - 사번 기반)
export type UserRequestDto = {
  userId: string // 사번
  password: string
}

// 로그인 응답 DTO (supabaseUserId, email 제외 - 보안)
export type UserResponseDto = Omit<User, 'supabaseUserId' | 'email'>

// 내부 서비스용 전체 User 타입 (Auth 작업 등에 사용)
export type InternalUserDto = User

// 로그인한 사용자 정보
export type CurrentUserModel = Pick<
  User,
  'id' | 'userId' | 'name' | 'hireDate' | 'role' | 'licensePhotoUrl' | 'createdAt'
>

export type updateUserRequestModel = Pick<
  User,
  'name' | 'role' | 'isActive' | 'licensePhotoUrl' | 'hireDate'
>
