import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiError } from '@/lib/core/errors'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { supabaseServer } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/utils/auth-guards'

export const runtime = 'nodejs'

/**
 * Master 계정 전용: 관리자/작업반장 비밀번호 초기화
 * 비밀번호를 사번(userId)으로 초기화하고 mustChangePassword를 true로 설정
 */
async function resetPassword(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. 세션 체크
  const session = await getSessionUser(req)

  // 2. Master 계정 확인
  if (session.userId !== 'master') {
    throw new ApiError('Master 계정만 비밀번호를 초기화할 수 있습니다.', 403, 'MASTER_ONLY')
  }

  // 3. params await 처리
  const { id } = await params

  // 4. 대상 사용자 조회
  const targetUser = await prisma.user.findUnique({
    where: { id },
  })

  if (!targetUser) {
    throw new ApiError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND')
  }

  // 4. 관리자/작업반장만 초기화 가능
  if (targetUser.role !== 'ADMIN' && targetUser.role !== 'MANAGER') {
    throw new ApiError(
      '관리자 또는 작업반장만 비밀번호를 초기화할 수 있습니다.',
      400,
      'INVALID_ROLE',
    )
  }

  // 5. Master 본인은 초기화 불가
  if (targetUser.userId === 'master') {
    throw new ApiError('Master 계정의 비밀번호는 초기화할 수 없습니다.', 400, 'MASTER_PROTECTED')
  }

  // 6. Supabase Auth 사용자가 없으면 에러
  if (!targetUser.supabaseUserId) {
    throw new ApiError('Supabase 인증 정보가 없습니다.', 400, 'NO_AUTH_USER')
  }

  // 7. Supabase Auth 비밀번호 초기화 (사번으로)
  const { error: updateError } = await supabaseServer.auth.admin.updateUserById(
    targetUser.supabaseUserId,
    {
      password: targetUser.userId, // 비밀번호를 사번으로 초기화
    },
  )

  if (updateError) {
    throw new ApiError(`비밀번호 초기화 실패: ${updateError.message}`, 500, 'AUTH_UPDATE_FAILED')
  }

  // 8. Prisma DB: mustChangePassword = true 설정
  await prisma.user.update({
    where: { id },
    data: {
      mustChangePassword: true,
    },
  })

  return ApiResponseFactory.success(
    { userId: targetUser.userId, name: targetUser.name },
    '비밀번호가 사번으로 초기화되었습니다.',
  )
}

export const POST = withErrorHandler(resetPassword)
