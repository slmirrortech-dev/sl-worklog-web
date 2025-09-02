import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session' // 싱글톤
import bcrypt from 'bcryptjs'
export const runtime = 'nodejs'

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 모든 직원 목록
 *     description: 모든 직원 목록을 조회한다
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, WORKER]
 *         description: 필터할 역할 (미지정 시 전체)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 사번 또는 이름으로 검색
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *         description: 페이지
 *       - in: query
 *         name: pageSize
 *         schema: {type: number, default: 10}
 *         description: 페이지 사이즈
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
export async function GET(request: NextRequest) {
  /** 관리자 권한 확인 */
  const sessionUser = await getSessionUser(request)
  // 관리자 및 최고관리자만 허용
  if (sessionUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자만 조회 가능합니다' }, { status: 403 })
  }

  /** 쿼리 파라미터 확인 */
  const { searchParams } = new URL(request.url)
  // 역할
  const roleParam = searchParams.get('role')?.toUpperCase() as 'ADMIN' | 'WORKER'
  const pageParam = parseInt(searchParams.get('page') || '1', 10)
  const pageSizeParam = parseInt(searchParams.get('pageSize') || '10', 10)
  const searchParam = searchParams.get('search') || ''

  /** 유효성 검사 */
  if (roleParam && roleParam !== 'ADMIN' && roleParam !== 'WORKER') {
    return NextResponse.json(
      { error: 'role 값은 ADMIN 또는 WORKER 이어야 합니다' },
      { status: 400 },
    )
  }
  if (isNaN(pageParam) || pageParam < 1 || isNaN(pageSizeParam) || pageSizeParam < 1) {
    return NextResponse.json(
      { error: 'page와 pageSize는 1 이상의 유효한 숫자여야 합니다' },
      { status: 400 },
    )
  }

  const skip = (pageParam - 1) * pageSizeParam
  const take = pageSizeParam

  // WHERE 절 구성
  const whereClause: Record<string, unknown> = {}

  if (roleParam) {
    whereClause.role = roleParam
  }

  if (searchParam) {
    whereClause.OR = [
      { loginId: { contains: searchParam, mode: 'insensitive' } },
      { name: { contains: searchParam, mode: 'insensitive' } },
    ]
  }

  try {
    // 총 데이터 수
    const totalCount = await prisma.user.count({ where: whereClause })

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        isActive: true,
        licensePhoto: true,
        createdAt: true,
      },
      skip: skip,
      take: take,
      orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
    })

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalCount / pageSizeParam)

    return NextResponse.json({
      success: true,

      data: users,
      totalCount,
      totalPages,
      currentPage: pageParam,
      pageSize: pageSizeParam,
    })
  } catch (error) {
    console.error(' error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 신규 사용자 등록(단일 또는 다건)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [loginId, name]
 *                 properties:
 *                   loginId: { type: string, description: 사번/로그인ID }
 *                   name: { type: string }
 *                   role: { type: string, enum: [ADMIN, WORKER], default: WORKER }
 *                   licensePhoto: { type: string, nullable: true }
 *                   adminMemo: { type: string, nullable: true }
 *                   isActive: { type: boolean, default: true }
 *               - type: array
 *                 items:
 *                   type: object
 *                   required: [loginId, name]
 *                   properties:
 *                     loginId: { type: string }
 *                     name: { type: string }
 *                     role: { type: string, enum: [ADMIN, WORKER], default: WORKER }
 *                     licensePhoto: { type: string, nullable: true }
 *                     adminMemo: { type: string, nullable: true }
 *                     isActive: { type: boolean, default: true }
 *           examples:
 *             single:
 *               value: { loginId: "W00123", name: "홍길동", role: "WORKER" }
 *             multiple:
 *               value:
 *                 - { loginId: "W00123", name: "홍길동", role: "WORKER" }
 *                 - { loginId: "A00001", name: "관리자", role: "ADMIN" }
 *     responses:
 *       201: { description: 생성됨 }
 *       400: { description: 잘못된 요청 }
 *       403: { description: 권한 없음 }
 *       409: { description: 일부/전부 중복 }
 */
export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser(request)
  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return NextResponse.json({ error: '관리자만 등록 가능합니다' }, { status: 403 })
  }

  const body = await request.json()
  const items: Array<{
    loginId: string
    name: string
    role?: 'ADMIN' | 'WORKER'
    licensePhoto?: string | null
    adminMemo?: string | null
    isActive?: boolean
  }> = Array.isArray(body) ? body : [body]

  // 최소 검증
  const invalid = items.filter((i) => !i?.loginId || !i?.name)
  if (invalid.length) {
    return NextResponse.json(
      { error: `loginId와 name은 필수입니다. invalid count=${invalid.length}` },
      { status: 400 },
    )
  }

  // payload 내 중복 제거
  const seen = new Set<string>()
  const dupInPayload: string[] = []
  const uniqueItems = items.filter((i) => {
    const key = i.loginId
    if (seen.has(key)) {
      dupInPayload.push(key)
      return false
    }
    seen.add(key)
    return true
  })

  // 이미 존재하는 loginId 조회
  const loginIds = uniqueItems.map((i) => i.loginId)
  const existing = await prisma.user.findMany({
    where: { loginId: { in: loginIds } },
    select: { loginId: true },
  })
  const existsSet = new Set(existing.map((e) => e.loginId))

  // 실제 생성할 목록
  const toCreate = uniqueItems.filter((i) => !existsSet.has(i.loginId))

  if (toCreate.length === 0) {
    return NextResponse.json(
      {
        success: true,
        createdCount: 0,
        skipped: {
          existing: Array.from(existsSet),
          duplicatedInPayload: dupInPayload,
        },
        data: [],
      },
      { status: 409 },
    )
  }

  // 초기 비밀번호 동일 → 해시 1번만
  const passwordHash = await bcrypt.hash('0000', 10)

  await prisma.user.createMany({
    data: toCreate.map((i) => ({
      loginId: i.loginId,
      name: i.name,
      role: (i.role ?? 'WORKER') as 'ADMIN' | 'WORKER',
      password: passwordHash,
      licensePhoto: i.licensePhoto ?? null,
      adminMemo: i.adminMemo ?? null,
      isActive: i.isActive ?? true,
    })),
    skipDuplicates: true, // 혹시 경합이 있어도 무시
  })

  // 방금 만든 사용자 조회해서 id 반환
  const createdUsers = await prisma.user.findMany({
    where: { loginId: { in: toCreate.map((i) => i.loginId) } },
    select: {
      id: true,
      loginId: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    {
      success: true,
      createdCount: createdUsers.length,
      skipped: {
        existing: existing.map((e) => e.loginId),
        duplicatedInPayload: dupInPayload,
      },
      data: createdUsers,
    },
    { status: 201 },
  )
}
