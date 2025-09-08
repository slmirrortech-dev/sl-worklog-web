import { SessionOptions } from 'iron-session'
import { User } from '@prisma/client'

// 세션에 저장할 사용자 정보 타입
export type SessionUser = Pick<User, 'id' | 'userId' | 'name' | 'role'>

/** iron-session : 세션 설정 파일 */
export const sessionOptions: SessionOptions = {
  cookieName: 'factory_session',
  password: process.env.SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production', // prod일 때만 secure
  },
}
