import { UserDto } from '../dto/user.dto'

export interface UserModel extends UserDto {
  isAdmin: boolean // role === 'ADMIN' 가공 필드
}
