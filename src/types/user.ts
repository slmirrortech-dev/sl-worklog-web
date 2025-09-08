import { User } from '@prisma/client'

// 로그인 요청 DTO
export type UserLoginRequestDto = Pick<User, 'userId' | 'password'>

// 로그인 응답 DTO
export type UserLoginResponseDto = Omit<User, 'password'>

// 로그인한 사용자 정보
export type CurrentUserModel = Pick<
  User,
  | 'id'
  | 'userId'
  | 'name'
  | 'birthday'
  | 'role'
  | 'isInitialPasswordChanged'
  | 'licensePhotoUrl'
  | 'createdAt'
>
