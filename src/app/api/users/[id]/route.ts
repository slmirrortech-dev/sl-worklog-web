import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session' // 싱글톤
export const runtime = 'nodejs'

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 특정 사용자 조회
 *     description: 경로 파라미터 id로 사용자를 조회합니다.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 잘못된 요청
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
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSessionUser(request)

  // 관리자 및 최고관리자만 허용
  if (sessionUser?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: '관리자만 조회 가능합니다' },
      { status: 403 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      loginId: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  try {
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error(' error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: 사용자 영구 삭제
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 삭제됨 }
 *       403: { description: 권한 없음 }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSessionUser(request)
  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
