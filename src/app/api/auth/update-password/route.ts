import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from '@/lib/core/errors'
import { withErrorHandler } from '@/lib/core/api-handler'
import { supabaseServer } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 비밀번호 변경 API (현재 비밀번호 확인)
 *
 * 1. 현재 비밀번호로 로그인 시도하여 검증
 * 2. Supabase Auth 비밀번호 변경
 * 3. 자동 재로그인
 **/
async function updatePassword(req: NextRequest) {
  const {
    userId,
    currentPassword,
    newPassword,
  }: { userId: string; currentPassword: string; newPassword: string } = await req.json()

  // 유효성 검사
  if (!userId || !currentPassword || !newPassword) {
    throw new ApiError('모든 필드를 입력해주세요.', 400)
  }

  if (newPassword.length < 6) {
    throw new ApiError('새 비밀번호는 최소 6자 이상이어야 합니다.', 400)
  }

  // 새 비밀번호가 사번과 동일한지 확인
  if (newPassword === userId) {
    throw new ApiError('새 비밀번호는 사번과 달라야 합니다.', 400)
  }

  // 현재 비밀번호와 새 비밀번호가 동일한지 확인
  if (currentPassword === newPassword) {
    throw new ApiError('새 비밀번호는 현재 비밀번호와 달라야 합니다.', 400)
  }

  // 현재 로그인된 사용자 정보 가져오기 (ANON_KEY 클라이언트 사용)
  const email = `${userId}@temp.invalid`
  const cookieStore = await cookies()
  const userSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // 쿠키 설정 불필요
      },
    },
  )

  // 현재 로그인된 사용자 확인
  const {
    data: { user: authUser },
  } = await userSupabase.auth.getUser()

  if (!authUser) {
    throw new ApiError('로그인이 필요합니다.', 401)
  }

  // 현재 비밀번호 검증 (로그인 시도)
  const { error: signInError } = await userSupabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })

  if (signInError) {
    throw new ApiError('현재 비밀번호가 일치하지 않습니다.', 401)
  }

  // Supabase Auth 비밀번호 변경
  const { error: updateError } = await supabaseServer.auth.admin.updateUserById(authUser.id, {
    password: newPassword,
  })

  if (updateError) {
    throw new ApiError('비밀번호 변경에 실패했습니다.', 500)
  }

  // 자동 재로그인 (새 비밀번호로)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

  const { error: reSignInError } = await supabase.auth.signInWithPassword({
    email,
    password: newPassword,
  })

  if (reSignInError) {
    console.error('재로그인 실패:', reSignInError)
    // 재로그인 실패해도 비밀번호는 변경되었으므로 성공으로 처리
  }

  return NextResponse.json({
    success: true,
    message: '비밀번호가 성공적으로 변경되었습니다.',
  })
}

export const POST = withErrorHandler(updatePassword)
