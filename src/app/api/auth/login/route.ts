import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { UserRequestDto } from '@/types/user'
import { ApiError } from '@/lib/core/errors'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 관리자/작업반장 로그인 API (사번 기반)
 *
 * 1. 사번을 이메일 형식으로 변환 (userId@temp.invalid)
 * 2. Supabase Auth로 이메일/비밀번호 인증
 * 3. Prisma DB에서 사용자 정보 조회
 * 4. 관리자/반장 권한 확인
 * 5. mustChangePassword 플래그 반환
 **/
export async function login(req: NextRequest) {
  const cookieStore = await cookies()
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

  const { userId, password }: UserRequestDto = await req.json()

  // 사번을 이메일 형식으로 변환
  const email = `${userId}@temp.invalid`

  // Supabase Auth로 로그인
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    throw new ApiError('사번 또는 비밀번호가 일치하지 않습니다.', 401)
  }

  // Prisma DB에서 사용자 정보 조회
  let user = await prisma.user.findUnique({
    where: {
      supabaseUserId: authData.user.id,
    },
  })

  if (!user) {
    // Supabase에는 있지만 DB에 없는 경우
    // 자동으로 DB에 사용자 생성 (첫 로그인 시)
    user = await prisma.user.create({
      data: {
        supabaseUserId: authData.user.id,
        email: authData.user.email!,
        userId: authData.user.email!.split('@')[0], // 이메일 @ 앞부분을 사번으로
        name: authData.user.email!.split('@')[0], // 임시 이름
        role: 'ADMIN', // 기본 역할
        isActive: true,
      },
    })
  }

  // 관리자 또는 작업반장 권한 확인
  if (user.role === 'WORKER') {
    await supabase.auth.signOut() // 보안: 작업자는 로그인 세션 즉시 파기
    throw new ApiError('관리자 권한이 필요합니다.', 403)
  }

  return NextResponse.json(user)
}

export const POST = withErrorHandler(login)
