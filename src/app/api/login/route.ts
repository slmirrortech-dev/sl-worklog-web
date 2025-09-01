import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json()

    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 조회 (email 또는 id로)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: id },
          { id: id }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 401 }
      )
    }

    // 기본적으로 간단한 비밀번호 검증 (실제로는 해시된 비밀번호 사용)
    // 임시로 admin/password 조합 허용
    if (id === 'admin' && password === 'password') {
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })

      // 세션 쿠키 설정
      response.cookies.set('session', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7일
      })

      return response
    }

    return NextResponse.json(
      { error: '로그인 정보가 올바르지 않습니다.' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}