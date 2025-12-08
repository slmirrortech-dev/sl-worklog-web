import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import prisma from '@/lib/core/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 로그인한 사용자 정보 조회 (Supabase Auth)
 **/
async function getCurrentUser(req: NextRequest) {
  const supabase = createRouteHandlerClient(req)

  // Supabase Auth 세션 확인
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser()

  if (error || !authUser) {
    return NextResponse.json({ success: false, message: '로그인이 필요합니다' }, { status: 401 })
  }

  // Prisma DB에서 사용자 정보 조회
  const user = await prisma.user.findUnique({
    where: {
      supabaseUserId: authUser.id,
    },
  })

  if (!user) {
    return NextResponse.json({ success: false, message: '사용자 정보를 찾을 수 없습니다' }, { status: 404 })
  }

  return ApiResponseFactory.success(user, '로그인한 사용자 정보 조회 성공')
}

export const GET = withErrorHandler(getCurrentUser)
