import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 로그인 사용자 정보 조회
 *     description: 세션 쿠키를 통해 현재 로그인한 사용자 정보를 반환
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: 인증된 사용자 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증되지 않음
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
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value

    if (!sessionId) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 세션 ID로 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        isSuperAdmin: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}