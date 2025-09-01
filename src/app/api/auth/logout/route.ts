import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/session'
export const runtime = 'nodejs'

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 세션 쿠키를 삭제하여 로그아웃
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function POST() {
  try {
    const res = NextResponse.json({ success: true, message: '로그아웃되었습니다' })
    return clearSessionCookie(res) // session 쿠키 삭제
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
