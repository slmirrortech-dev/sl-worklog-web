import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { UserLoginRequestDto } from '@/types/user'
import { ApiError } from '@/lib/core/errors'
import bcrypt from 'bcryptjs'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionUser } from '@/lib/core/session'

/**
 * 로그인 API
 **/
export async function login(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = (searchParams.get('role') || 'WORKER').toUpperCase()
  const { userId, password }: UserLoginRequestDto = await req.json()

  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  })

  if (!user) {
    throw new ApiError('계정을 찾을 수 없습니다.', 404)
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new ApiError('비밀번호가 일치하지 않습니다.', 401)
  }

  // 관리자용 로그인 일 경우
  if (role === 'ADMIN') {
    // 권한이 WORKER 이면 로그인 불가
    if (user.role === 'WORKER') {
      throw new ApiError('관리자 권한이 필요합니다.', 403)
    }
  }

  // 세션 생성
  const res = NextResponse.json(user)
  const session = await getIronSession<SessionUser>(req, res, sessionOptions)

  session.id = user.id
  session.userId = user.userId
  session.name = user.name
  session.role = user.role
  await session.save()

  return res
}
export const POST = withErrorHandler(login)
