import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants/routes'
import { createMiddlewareClient } from '@/lib/supabase/server'

export async function middleware(req: NextRequest) {
  const { supabase, response } = createMiddlewareClient(req)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // 비로그인 사용자 처리
  if (!user) {
    // 접근하려는 페이지가 보호된 admin 경로이고, 로그인 페이지가 아닌 경우
    if (pathname.startsWith('/admin') && pathname !== ROUTES.ADMIN.LOGIN) {
      // 로그인 페이지로 리디렉션
      return NextResponse.redirect(new URL(ROUTES.ADMIN.LOGIN, req.url))
    }
  }
  // 로그인한 사용자 처리
  else {
    // 로그인한 사용자가 로그인 페이지에 접근하려고 하는 경우
    if (pathname === ROUTES.ADMIN.LOGIN) {
      // 작업장 현황으로 리디렉션 (비밀번호 변경은 layout에서 체크)
      return NextResponse.redirect(new URL(ROUTES.ADMIN.WORKPLACE, req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // monitor 페이지는 matcher에서 제외하여 미들웨어를 통과하지 않도록 함 (완전 공개)
    // 단, /monitor 경로를 미들웨어 로직에 포함시키고 싶다면 아래 줄을 삭제하세요.
    // '/monitor/:path*',
  ],
}
