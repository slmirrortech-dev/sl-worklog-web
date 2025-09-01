import { NextRequest, NextResponse } from 'next/server'
import { authenticate, assertRole } from '@/lib/auth'
import { jsonWithSession } from '@/lib/session'
export const runtime = 'nodejs'

/**
 * @swagger
 * /api/auth/login/worker:
 *   post:
 *     summary: 작업자 로그인
 *     description: 작업자 및 관리자 로그인 엔드포인트
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             id: "worker01"
 *             password: "0000"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function POST(req: NextRequest) {
  try {
    const { id, password } = await req.json()
    const user = await authenticate(id, password)
    if (!user) return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    
    // 작업자 및 관리자 모두 허용
    if (user.role !== 'WORKER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    return jsonWithSession(
      { success: true, user: { id: user.id, loginId: user.loginId, name: user.name, role: user.role } },
      user.id
    )
  } catch (error) {
    console.error('Worker login error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
