import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants/routes'
import { getSessionUser, requireManagerOrAdmin, requireUser } from '@/lib/utils/auth-guards'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // -----------------------
  // ADMIN 영역
  // -----------------------
  // ADMIN LOGIN 접근 시
  if (pathname === ROUTES.ADMIN.LOGIN) {
    try {
      const session = await getSessionUser(req)

      if (!session) {
        // 로그인 안 된 경우 → 로그인 페이지 접근 허용
        return NextResponse.next()
      }

      if (session.role === 'ADMIN' || session.role === 'MANAGER') {
        // 관리자/반장은 로그인 페이지 접근 시
        return NextResponse.redirect(new URL(ROUTES.ADMIN.SETTING_LINE, req.url))
      }

      if (session.role === 'WORKER') {
        // 작업자가 /admin/login 접근
        return NextResponse.redirect(new URL(ROUTES.ERROR['403'], req.url))
      }
    } catch (error) {
      // 세션 오류 시 로그인 페이지 접근 허용
      console.error('Session error in middleware:', error)
      return NextResponse.next()
    }
  }

  if (pathname.startsWith('/admin')) {
    try {
      // 세션 및 권한 체크
      await requireManagerOrAdmin(req)
      return NextResponse.next()
    } catch (err: any) {
      if (err.status === 401) {
        // 로그인 필요
        return NextResponse.redirect(new URL(ROUTES.ADMIN.LOGIN, req.url))
      }

      if (err.status === 403) {
        // 권한 부족
        return NextResponse.redirect(new URL(ROUTES.ERROR['403'], req.url))
      }
    }
  }

  // -----------------------
  // WORKER 영역
  // -----------------------
  // ADMIN LOGIN 접근 시
  if (pathname === ROUTES.WORKER.LOGIN) {
    try {
      const session = await requireUser(req)
      if (session) {
        return NextResponse.redirect(new URL(ROUTES.WORKER.HOME, req.url))
      }
    } catch {
      return NextResponse.next()
    }
  }
  if (pathname.startsWith('/worker')) {
    try {
      // 세션 확인
      await requireUser(req)
      return NextResponse.next()
    } catch (err: any) {
      if (err.status === 401) {
        // 로그인 필요
        return NextResponse.redirect(new URL(ROUTES.WORKER.LOGIN, req.url))
      }
    }
  }

  return NextResponse.next()
}
