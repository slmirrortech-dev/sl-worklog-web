import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const WEEK = 60 * 60 * 24 * 7

export function withSessionCookie(
  res: NextResponse,
  sessionValue: string,
  opts?: { path?: string; maxAge?: number },
) {
  res.cookies.set('session', sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: opts?.path ?? '/',
    maxAge: opts?.maxAge ?? WEEK,
  })
  return res
}

export function clearSessionCookie(res: NextResponse, path: string = '/') {
  res.cookies.set('session', '', { path, maxAge: 0 })
  return res
}

// 편의: 바로 JSON 응답 + 쿠키 설정까지
export function jsonWithSession(
  body: unknown,
  sessionValue: string,
  init?: ResponseInit,
  opts?: { path?: string; maxAge?: number },
) {
  const res = NextResponse.json(body, init)
  return withSessionCookie(res, sessionValue, opts)
}

/** 로그인 후 쿠키에 user.id를 넣는 현재 방식에 맞춘 세션 사용자 조회 */
export async function getSessionUser(req: NextRequest) {
  const id = req.cookies.get('session')?.value
  if (!id) return null
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      loginId: true,
      name: true,
      role: true,
      isSuperAdmin: true,
    },
  })
}
