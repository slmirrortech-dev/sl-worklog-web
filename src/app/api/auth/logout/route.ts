import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionUser } from '@/lib/core/session'
import { withErrorHandler } from '@/lib/core/api-handler'

/**
 * 로그아웃 API
 **/
async function logout(req: NextRequest) {
  // 응답 객체 미리 생성
  const res = NextResponse.json({ success: true })

  // 세션 가져오기
  const session = await getIronSession<SessionUser>(req, res, sessionOptions)

  // 세션 파기
  session.destroy()
  return res
}

export const POST = withErrorHandler(logout)
