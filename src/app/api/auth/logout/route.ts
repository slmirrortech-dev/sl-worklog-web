import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { createRouteHandlerClient } from '@/lib/supabase/server'

/**
 * 로그아웃 API (Supabase Auth)
 **/
async function logout(req: NextRequest) {
  const supabase = createRouteHandlerClient(req)

  // Supabase Auth 세션 종료
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}

export const POST = withErrorHandler(logout)
