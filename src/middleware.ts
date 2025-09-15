import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants/routes'

/** iron-session 쿠키 이름 */
const SESSION_COOKIE = 'factory_session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // -----------------------
  // ADMIN 영역
  // -----------------------
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지 접근
    if (pathname === ROUTES.ADMIN.LOGIN) {
      // 세션이 유효하면 status로 이동
      if (await isValidSession(req)) {
        return NextResponse.redirect(new URL(ROUTES.ADMIN.SETTING_LINE, req.url))
      }
      return NextResponse.next()
    }

    // 그 외 admin 페이지 세션 검증
    if (!(await isValidSession(req))) {
      return NextResponse.redirect(new URL(ROUTES.ADMIN.LOGIN, req.url))
    }
  }

  // -----------------------
  // WORKER 영역
  // -----------------------
  if (pathname.startsWith('/worker')) {
    if (pathname === ROUTES.WORKER.LOGIN) {
      if (await isValidSession(req)) {
        return NextResponse.redirect(new URL(ROUTES.WORKER.WORK_LOG, req.url))
      }
      return NextResponse.next()
    }

    if (!(await isValidSession(req))) {
      return NextResponse.redirect(new URL(ROUTES.WORKER.LOGIN, req.url))
    }
  }

  return NextResponse.next()
}

/** 세션 유효성 검증 */
async function isValidSession(req: NextRequest): Promise<boolean> {
  const sessionCookie = req.cookies.get(SESSION_COOKIE)
  if (!sessionCookie) return false

  try {
    // API 호출해서 실제 세션 검증
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/current-user`, {
      headers: { Cookie: `${SESSION_COOKIE}=${sessionCookie.value}` },
    })

    if (res.status === 200) return true
    return false
  } catch (err) {
    console.error('Session check failed:', err)
    return false
  }
}

// 보호할 경로 지정
export const config = {
  matcher: ['/admin/:path*', '/worker/:path*'],
}
