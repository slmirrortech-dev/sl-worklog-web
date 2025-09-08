import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants/routes'

// iron-session 쿠키 이름
const SESSION_COOKIE = 'factory_session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const sessionCookie = req.cookies.get(SESSION_COOKIE)

  // -----------------------
  // ADMIN
  // -----------------------
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지 접근
    if (pathname === ROUTES.ADMIN.LOGIN) {
      if (sessionCookie) {
        // 로그인 된 상태라면 status로 보내기
        return NextResponse.redirect(new URL(ROUTES.ADMIN.STATUS, req.url))
      }
      // 로그인 안 한 경우 → 로그인 페이지 접근 허용
      return NextResponse.next()
    }

    // admin 하위 접근 (로그인 필요)
    if (!sessionCookie) {
      return NextResponse.redirect(new URL(ROUTES.ADMIN.LOGIN, req.url))
    }

    // 권한 체크는 여기서 하지 않고 API/서버 컴포넌트에서 requireAdmin으로 처리
  }

  // -----------------------
  // WORKER
  // -----------------------
  if (pathname.startsWith('/worker')) {
    // 로그인 페이지 접근
    if (pathname === ROUTES.WORKER.LOGIN) {
      if (sessionCookie) {
        return NextResponse.redirect(new URL(ROUTES.WORKER.WORK_LOG, req.url))
      }
      return NextResponse.next()
    }

    // worker 하위 접근 (로그인 필요)
    if (!sessionCookie) {
      return NextResponse.redirect(new URL(ROUTES.WORKER.LOGIN, req.url))
    }
  }

  return NextResponse.next()
}

// 보호할 경로 지정
export const config = {
  matcher: ['/admin/:path*', '/worker/:path*'],
}
