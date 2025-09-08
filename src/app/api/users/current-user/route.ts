import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionUser } from '@/lib/core/session'
import { withErrorHandler } from '@/lib/core/api-handler'
import { findUserOrThrow } from '@/lib/service/user.servie'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 로그인한 사용자 정보 조회
 **/
async function getCurrentUser(req: NextRequest) {
  const res = new NextResponse()
  const { id } = await getIronSession<SessionUser>(req, res, sessionOptions)

  if (!id) {
    return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 })
  }

  const user = await findUserOrThrow(id)

  return ApiResponseFactory.success(user, '로그인한 사용자 정보 조회 성공')
}

export const GET = withErrorHandler(getCurrentUser)
