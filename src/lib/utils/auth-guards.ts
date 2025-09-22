import { getIronSession } from 'iron-session'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sessionOptions, SessionUser } from '@/lib/core/session'
import { ApiError } from '@/lib/core/errors'

/** 세션 읽기 */
export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const res = new NextResponse()
  const session = await getIronSession<SessionUser>(req, res, sessionOptions)

  if (!session?.userId) {
    return null
  }

  return session
}

/** 로그인만 돼 있으면 허용 */
export async function requireUser(req: NextRequest) {
  const session = await getSessionUser(req)
  if (!session?.userId) {
    throw new ApiError('로그인이 필요합니다.', 401, 'UNAUTHORIZED')
  }
  return session
}

/** 관리자(ADMIN) 전용 */
export async function requireAdmin(req: NextRequest) {
  const session = await getSessionUser(req)

  if (!session) {
    throw new ApiError('로그인이 필요합니다', 401, 'UNAUTHORIZED')
  }

  if (session.role !== 'ADMIN') {
    throw new ApiError('관리자 권한이 필요합니다.', 403, 'FORBIDDEN')
  }
  return session
}

/** 관리자 또는 반장(ADMIN, MANAGER) 전용 */
export async function requireManagerOrAdmin(req: NextRequest) {
  const session = await getSessionUser(req)

  if (!session) {
    throw new ApiError('로그인이 필요합니다', 401, 'UNAUTHORIZED')
  }

  if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
    throw new ApiError('관리자 또는 반장 권한이 필요합니다.', 403, 'FORBIDDEN')
  }
  return session
}

/** 서버 컴포넌트에서 세션 가져오기 */
export async function getServerSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const session = await getIronSession<SessionUser>(cookieStore, sessionOptions)

    if (!session?.userId) {
      return null
    }

    return session
  } catch (error) {
    console.error('세션 가져오기 실패:', error)
    return null
  }
}
