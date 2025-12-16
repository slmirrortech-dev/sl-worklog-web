import { NextRequest, NextResponse } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { UserResponseDto } from '@/types/user'
import { Role } from '@prisma/client'
import { ApiError } from '@/lib/core/errors'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { supabaseServer } from '@/lib/supabase/server'
export const runtime = 'nodejs'

/**
 * 전체 직원 조회
 **/
export async function getUsers(request: NextRequest) {
  // 관리자 권한 확인
  await requireManagerOrAdmin(request)

  // 쿼리 파라미터 확인
  const { searchParams } = new URL(request.url)
  // 역할 (다중 role 지원)
  const roleParam = searchParams.get('role')
  const pageParam = parseInt(searchParams.get('page') || '1', 10)
  const pageSizeParam = parseInt(searchParams.get('pageSize') || '10', 10)
  const searchParam = decodeURIComponent(searchParams.get('search') || '')

  /** 유효성 검사 */
  if (roleParam) {
    const roles = roleParam.split(';')
    const validRoles = ['ADMIN', 'MANAGER', 'WORKER']
    const invalidRoles = roles.filter((role) => !validRoles.includes(role.toUpperCase()))
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `잘못된 role 값: ${invalidRoles.join(', ')}` },
        { status: 400 },
      )
    }
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
  const whereClause: Record<string, unknown> = {
    isActive: true,
  }

  if (roleParam) {
    const roles = roleParam.split(';').map((r) => r.toUpperCase())
    if (roles.length === 1) {
      whereClause.role = roles[0]
    } else {
      whereClause.role = { in: roles }
    }
  }

  if (searchParam) {
    whereClause.OR = [
      { userId: { contains: searchParam, mode: 'insensitive' } },
      { name: { contains: searchParam, mode: 'insensitive' } },
    ]
  }

  // 총 데이터 수
  const totalCount = await prisma.user.count({ where: whereClause })

  const users = (await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      userId: true,
      name: true,
      hireDate: true,
      role: true,
      licensePhotoUrl: true,
      isActive: true,
      deactivatedAt: true,
      createdAt: true,
    },
    skip: skip,
    take: take,
    orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
  })) as UserResponseDto[]

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalCount / pageSizeParam)

  return ApiResponseFactory.success({
    data: users,
    totalCount,
    totalPages,
    currentPage: pageParam,
    pageSize: pageSizeParam,
  })
}

export const GET = withErrorHandler(getUsers)

/**
 * 신규 사용자 등록 (단일 또는 다건)
 */
async function createUsers(req: NextRequest) {
  // 관리자 권한 확인
  await requireManagerOrAdmin(req)

  const body = await req.json()
  const items: Array<{
    userId: string
    name: string
    hireDate?: string
    role: Role
  }> = Array.isArray(body) ? body : [body]

  // 최소 검증
  const invalid = items.filter((i) => !i?.userId || !i?.name)
  if (invalid.length) {
    throw new ApiError(
      `userId, name은 필수입니다. invalid count=${invalid.length}`,
      400,
      'INVALID_PAYLOAD',
    )
  }

  // payload 내 중복 제거
  const seen = new Set<string>()
  const dupInPayload: string[] = []
  const uniqueItems = items.filter((i) => {
    if (seen.has(i.userId)) {
      dupInPayload.push(i.userId)
      return false
    }
    seen.add(i.userId)
    return true
  })

  // userId 기준으로 DB 조회
  const userIds = uniqueItems.map((i) => i.userId)
  const existingUsers = await prisma.user.findMany({
    where: { userId: { in: userIds } },
  })

  const createdUsers = []
  const reactivatedUsers = []
  const skippedActive: string[] = []

  for (const item of uniqueItems) {
    const existing = existingUsers.find((u) => u.userId === item.userId)
    const isAdminOrManager = item.role === 'ADMIN' || item.role === 'MANAGER'

    // hireDate 처리: 빈 문자열은 undefined로 변환
    const hireDate = item.hireDate?.trim() || undefined

    // 이미 있고 활성화 상태 : skip
    if (existing && existing.isActive) {
      skippedActive.push(item.userId)
      continue
    }

    // 이미 있고 비활성 상태 : 복구 + 덮어쓰기
    if (existing && !existing.isActive) {
      // 관리자/반장인 경우에만 Supabase Auth 사용자 생성
      let supabaseUserId = existing.supabaseUserId
      let email = existing.email

      if (isAdminOrManager) {
        // 관리자/반장은 임시 이메일 형식 사용 (userId@temp.invalid)
        email = `${item.userId}@temp.invalid`
        const initialPassword = item.userId // 초기 비밀번호 (사번과 동일)

        try {
          if (existing.supabaseUserId) {
            // 기존 Supabase 사용자 확인
            const { data: existingAuthUser } = await supabaseServer.auth.admin.getUserById(
              existing.supabaseUserId,
            )
            if (!existingAuthUser.user) {
              // Supabase 사용자가 없으면 새로 생성
              const { data: newAuthUser, error } = await supabaseServer.auth.admin.createUser({
                email,
                password: initialPassword,
                email_confirm: true,
              })
              if (error || !newAuthUser.user) {
                throw new ApiError(`Supabase 사용자 생성 실패: ${error?.message}`, 500)
              }
              supabaseUserId = newAuthUser.user.id
            }
          } else {
            // supabaseUserId가 없으면 새로 생성
            const { data: newAuthUser, error } = await supabaseServer.auth.admin.createUser({
              email,
              password: initialPassword,
              email_confirm: true,
            })
            if (error || !newAuthUser.user) {
              throw new ApiError(`Supabase 사용자 생성 실패: ${error?.message}`, 500)
            }
            supabaseUserId = newAuthUser.user.id
          }
        } catch (error) {
          // 에러 발생 시에도 새로 생성 시도
          const { data: newAuthUser, error: createError } =
            await supabaseServer.auth.admin.createUser({
              email,
              password: initialPassword,
              email_confirm: true,
            })
          if (createError || !newAuthUser.user) {
            throw new ApiError(`Supabase 사용자 생성 실패: ${createError?.message}`, 500)
          }
          supabaseUserId = newAuthUser.user.id
        }
      }

      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          supabaseUserId,
          email,
          name: item.name,
          hireDate,
          role: item.role ?? 'WORKER',
          mustChangePassword: isAdminOrManager, // 관리자/반장은 비밀번호 변경 필수
          isActive: true,
          deactivatedAt: null,
        },
      })
      reactivatedUsers.push(updated)
      continue
    }

    // 존재하지 않음 : 새로 생성
    if (isAdminOrManager) {
      // 관리자/반장: Supabase Auth + Prisma DB에 생성
      const email = `${item.userId}@temp.invalid`
      const initialPassword = item.userId // 초기 비밀번호 (사번과 동일)

      const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
        email,
        password: initialPassword,
        email_confirm: true,
      })

      if (authError || !authData.user) {
        throw new ApiError(`Supabase 사용자 생성 실패: ${authError?.message}`, 500)
      }

      const newUser = await prisma.user.create({
        data: {
          supabaseUserId: authData.user.id,
          email: authData.user.email,
          userId: item.userId,
          name: item.name,
          hireDate,
          role: item.role,
          mustChangePassword: true, // 초기 비밀번호 변경 필수
          isActive: true,
        },
      })
      createdUsers.push(newUser)
    } else {
      // 작업자: Prisma DB에만 생성 (Supabase Auth 사용 안 함)
      const newUser = await prisma.user.create({
        data: {
          userId: item.userId,
          name: item.name,
          hireDate,
          role: 'WORKER',
          mustChangePassword: false, // 작업자는 로그인하지 않음
          isActive: true,
        },
      })
      createdUsers.push(newUser)
    }
  }

  return ApiResponseFactory.success(
    {
      createdCount: createdUsers.length,
      reactivatedCount: reactivatedUsers.length,
      skipped: {
        duplicatedInPayload: dupInPayload,
        alreadyActive: skippedActive,
      },
      data: [...createdUsers, ...reactivatedUsers],
    },
    '사용자 생성/복구 완료',
    201,
  )
}

export const POST = withErrorHandler(createUsers)
