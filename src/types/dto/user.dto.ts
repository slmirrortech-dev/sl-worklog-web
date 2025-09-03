import { User as PrismaUser } from '@prisma/client'

// 사용자 기본 정보
export type UserDto = Pick<
  PrismaUser,
  'id' | 'loginId' | 'name' | 'role' | 'licensePhoto' | 'isActive' | 'createdAt' | 'updatedAt'
>

// PATCH 요청용 타입
export type UpdateUserDto = Partial<Pick<UserDto, 'name' | 'role'>>
