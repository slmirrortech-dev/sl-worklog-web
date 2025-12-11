import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiError } from '@/lib/core/errors'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 비밀번호 변경 필요 여부 체크 API
 */
export async function checkPasswordChange(req: NextRequest) {
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

  // 로그인 확인
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    throw new ApiError('로그인이 필요합니다.', 401)
  }

  // DB에서 mustChangePassword 확인
  const user = await prisma.user.findUnique({
    where: {
      supabaseUserId: authUser.id,
    },
    select: {
      mustChangePassword: true,
    },
  })

  if (!user) {
    throw new ApiError('사용자를 찾을 수 없습니다.', 404)
  }

  return NextResponse.json({
    mustChangePassword: user.mustChangePassword,
  })
}

export const GET = withErrorHandler(checkPasswordChange)
