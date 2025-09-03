import { UserDto } from '@/types/dto/user.dto'
import { UserModel } from '@/types/models/user.model'

export function toUserModel(dto: UserDto): UserModel {
  return {
    ...dto,
    isAdmin: dto.role === 'ADMIN',
  }
}
