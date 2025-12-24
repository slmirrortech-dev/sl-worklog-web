import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { findUserOrThrow } from '@/lib/service/user.servie'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { ApiError } from '@/lib/core/errors'
import prisma from '@/lib/core/prisma'
import { updateUserRequestModel, UserResponseDto } from '@/types/user'
import { supabaseServer } from '@/lib/supabase/server'
import { Role } from '@prisma/client'

/**
 * 특정 사용자 정보 수정
 **/

async function updateUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireManagerOrAdmin(req)
  const { id } = await params
  const targetUser = await findUserOrThrow(id)

  const body: Partial<updateUserRequestModel> = await req.json().catch(() => ({}))

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.role !== undefined) data.role = body.role
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.licensePhotoUrl !== undefined) data.licensePhoto = body.licensePhotoUrl
  if (body.hireDate !== undefined) data.hireDate = body.hireDate

  if (Object.keys(data).length === 0) {
    throw new ApiError('수정할 값이 없습니다', 400, 'NO_UPDATE')
  }

  if (currentUser.id === id && (body.role === 'WORKER' || body.role === 'MANAGER')) {
    throw new ApiError('자기 자신의 권한을 변경할 수 없습니다.', 400, 'SELF_DOWNGRADE')
  }

  // 역할 변경 시 Supabase Auth 계정 추가/삭제 처리
  if (body.role !== undefined && body.role !== targetUser.role) {
    const oldRole = targetUser.role
    const newRole = body.role as Role

    const wasAdminOrManager = oldRole === 'ADMIN' || oldRole === 'MANAGER'
    const isAdminOrManager = newRole === 'ADMIN' || newRole === 'MANAGER'

    // WORKER → ADMIN/MANAGER: Auth 계정 생성
    if (!wasAdminOrManager && isAdminOrManager) {
      const email = `${targetUser.userId}@temp.invalid`
      const initialPassword = targetUser.userId

      const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
        email,
        password: initialPassword,
        email_confirm: true,
      })

      if (authError || !authData.user) {
        throw new ApiError(`Supabase 사용자 생성 실패: ${authError?.message}`, 500)
      }

      data.supabaseUserId = authData.user.id
      data.email = authData.user.email
      data.mustChangePassword = true // 비밀번호 변경 필수
    }

    // ADMIN/MANAGER → WORKER: Auth 계정 삭제
    if (wasAdminOrManager && !isAdminOrManager) {
      if (targetUser.supabaseUserId) {
        try {
          const { error } = await supabaseServer.auth.admin.deleteUser(targetUser.supabaseUserId)
          if (error) {
            console.error('Supabase Auth 사용자 삭제 실패:', error)
            // 삭제 실패해도 계속 진행
          }
        } catch (error) {
          console.error('Supabase Auth 사용자 삭제 중 오류:', error)
          // 오류 발생해도 계속 진행
        }
      }

      data.supabaseUserId = null
      data.email = null
      data.mustChangePassword = false
    }
  }

  const updatedUser = (await prisma.user.update({
    where: { id },
    data,
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
  })) as UserResponseDto

  return ApiResponseFactory.success(updatedUser, '사용자 수정 성공')
}
export const PATCH = withErrorHandler(updateUser)

/**
 * 사용자 삭제
 * (소프트 삭제 + Supabase Auth 계정 삭제)
 **/
async function deleteUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireManagerOrAdmin(req)
  const { id } = await params
  const targetUser = await findUserOrThrow(id)

  if (currentUser.id === id) {
    throw new ApiError('자기 자신은 탈퇴할 수 없습니다.', 400, 'SELF')
  }

  // 관리자/반장인 경우 Supabase Auth 계정도 삭제
  console.log('[DELETE] 타겟 사용자:', {
    id: targetUser.id,
    userId: targetUser.userId,
    role: targetUser.role,
    supabaseUserId: targetUser.supabaseUserId,
  })

  if (
    targetUser.supabaseUserId &&
    (targetUser.role === 'ADMIN' || targetUser.role === 'MANAGER')
  ) {
    console.log('[DELETE] Auth 삭제 시작:', targetUser.supabaseUserId)
    try {
      const { error } = await supabaseServer.auth.admin.deleteUser(targetUser.supabaseUserId)
      if (error) {
        console.error('[DELETE] ❌ Auth 삭제 실패:', error)
      } else {
        console.log('[DELETE] ✅ Auth 삭제 성공')
      }
    } catch (error) {
      console.error('[DELETE] ❌ Auth 삭제 예외:', error)
    }
  } else {
    console.log('[DELETE] Auth 삭제 조건 미충족 - 스킵')
  }

  const deletedUser = await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
      deactivatedAt: new Date(),
    },
  })

  return ApiResponseFactory.success(deletedUser, '사용자가 비활성화되었습니다.')
}
export const DELETE = withErrorHandler(deleteUser)
