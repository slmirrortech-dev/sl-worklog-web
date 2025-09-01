import { NextResponse } from 'next/server'

const WEEK = 60 * 60 * 24 * 7

export function withSessionCookie(
  res: NextResponse,
  sessionValue: string,
  opts?: { path?: string; maxAge?: number }
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
  body: any,
  sessionValue: string,
  init?: ResponseInit,
  opts?: { path?: string; maxAge?: number }
) {
  const res = NextResponse.json(body, init)
  return withSessionCookie(res, sessionValue, opts)
}
