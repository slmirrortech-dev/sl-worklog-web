import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { createRouteHandlerClient } from '@/lib/supabase/server'

/**
 * 로그아웃 API (Supabase Auth)
 **/
async function logout(req: NextRequest) {
  // Response 객체를 먼저 생성하여 쿠키 삭제를 반영할 수 있도록 함
  const response = NextResponse.json({ success: true })
  const supabase = createRouteHandlerClient(req, response)

  // Supabase Auth 세션 종료 (쿠키 삭제)
  await supabase.auth.signOut()

  return response
}

export const POST = withErrorHandler(logout)
