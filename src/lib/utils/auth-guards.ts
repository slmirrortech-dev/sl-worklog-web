import { NextRequest } from 'next/server'
import { ApiError } from '@/lib/core/errors'
import { createMiddlewareClient, createServerSupabaseClient } from '@/lib/supabase/server'
import prisma from '@/lib/core/prisma'
import { Role } from '@prisma/client'

export type SessionUser = {
  id: string
  userId: string
  name: string
  role: Role
  mustChangePassword: boolean
}

/** 미들웨어용 세션 읽기 */
export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  try {
    const { supabase } = createMiddlewareClient(req)
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return null
    }

    // Prisma DB에서 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: {
        supabaseUserId: authUser.id,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error('세션 가져오기 실패:', error)
    return null
  }
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
    const supabase = await createServerSupabaseClient()

    // getSession()을 먼저 시도 (쿠키에서 세션 읽기)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      console.log('[getServerSession] 세션 없음')
      return null
    }

    console.log('[getServerSession] Supabase User ID:', session.user.id)

    // Prisma DB에서 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: {
        supabaseUserId: session.user.id,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
        mustChangePassword: true,
      },
    })

    if (!user) {
      console.log('[getServerSession] DB에 사용자 없음:', session.user.id)
      return null
    }

    console.log('[getServerSession] 세션 조회 성공:', user.userId)
    return user
  } catch (error) {
    console.error('[getServerSession] 세션 가져오기 실패:', error)
    return null
  }
}
