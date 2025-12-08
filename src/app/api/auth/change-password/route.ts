import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiError } from '@/lib/core/errors'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * 비밀번호 변경 API (초기 비밀번호 변경용)
 *
 * 1. 사번과 이름으로 사용자 확인
 * 2. Supabase Auth 비밀번호 변경
 * 3. mustChangePassword 플래그를 false로 업데이트
 **/
export async function changePassword(req: NextRequest) {
  const {
    userId,
    name,
    newPassword,
  }: { userId: string; name: string; newPassword: string } = await req.json()

  // 유효성 검사
  if (!userId || !name || !newPassword) {
    throw new ApiError('사번, 이름, 새 비밀번호를 모두 입력해주세요.', 400)
  }

  if (newPassword.length < 6) {
    throw new ApiError('새 비밀번호는 최소 6자 이상이어야 합니다.', 400)
  }

  // 초기 비밀번호(사번)와 동일한지 확인
  if (newPassword === userId) {
    throw new ApiError('새 비밀번호는 사번과 달라야 합니다.', 400)
  }

  // DB에서 사용자 확인 (사번과 이름 일치 확인)
  const user = await prisma.user.findFirst({
    where: {
      userId: userId,
      name: name,
      isActive: true,
    },
  })

  if (!user || !user.supabaseUserId) {
    throw new ApiError('사번 또는 이름이 일치하지 않습니다.', 401)
  }

  // Supabase Auth 비밀번호 변경 (admin API 사용)
  const { error: updateError } = await supabaseServer.auth.admin.updateUserById(
    user.supabaseUserId,
    {
      password: newPassword,
    },
  )

  if (updateError) {
    throw new ApiError('비밀번호 변경에 실패했습니다.', 500)
  }

  // DB에서 mustChangePassword 플래그 업데이트
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      mustChangePassword: false,
    },
  })

  return NextResponse.json({
    success: true,
    message: '비밀번호가 성공적으로 변경되었습니다.',
  })
}

export const POST = withErrorHandler(changePassword)
