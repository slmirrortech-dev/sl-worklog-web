import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session' // 싱글톤
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionUser(request)

  // 관리자 및 최고관리자만 허용
  if (sessionUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자만 조회 가능합니다' }, { status: 403 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      loginId: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: '해당 직원이 존재하지 않습니다.' }, { status: 400 })
  }

  try {
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error(' error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: 사용자 정보 수정
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, WORKER]
 *                 default: WORKER
 *               licensePhoto:
 *                 type: string
 *                 nullable: true
 *                 description: 파일 업로드는 POST /api/users/{id}/license-photo 로 처리하세요.
 *     responses:
 *       200: { description: 성공 }
 *       403: { description: 권한 없음 }
 *       404: { description: 없음 }
 *       400: { description: 잘못된 입력 }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionUser(request)
  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  const { id } = await params

  // 본문이 없거나 JSON 아님 → {} 로 처리
  const body = (await request.json().catch(() => ({}))) as {
    name?: string
    role?: 'ADMIN' | 'WORKER'
    isActive?: boolean
    adminMemo?: string | null
    licensePhoto?: string | null
  }

  // 존재 확인
  const exists = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!exists) return NextResponse.json({ error: '존재하지 않는 사용자' }, { status: 404 })

  // 넘어온 필드만 업데이트
  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.role !== undefined) data.role = body.role
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.adminMemo !== undefined) data.adminMemo = body.adminMemo
  if (body.licensePhoto !== undefined) data.licensePhoto = body.licensePhoto

  // 아무 변경도 없으면 안내
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: '수정할 값이 없습니다' }, { status: 400 })
  }

  // 자기 자신 강등 금지
  if (sessionUser.id === id && sessionUser.role === 'ADMIN' && body.role === 'WORKER') {
    return NextResponse.json({ error: '자기 자신을 작업자로 변경할 수 없습니다.' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      loginId: true,
      name: true,
      role: true,
      isActive: true,
      adminMemo: true,
      licensePhoto: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ success: true, data: updated })
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
  { params }: { params: Promise<{ id: string }> },
) {
  const sessionUser = await getSessionUser(request)
  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
