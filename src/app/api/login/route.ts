import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 관리자 로그인
 *     description: 최고관리자는 ID로 일반 관리자는 사번과 비밀번호로 로그인
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             id: "admin"
 *             password: "0000"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json()

    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 조회 (loginId로)
    const user = await prisma.user.findUnique({
      where: { loginId: id }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 401 }
      )
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { error: '로그인 정보가 올바르지 않습니다.' },
        { status: 401 }
      )
    }
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        role: user.role,
      },
    })

    response.cookies.set('session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7일
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
