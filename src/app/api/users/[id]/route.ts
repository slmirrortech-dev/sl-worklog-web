import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { findUserOrThrow } from '@/lib/service/user.servie'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { ApiError } from '@/lib/core/errors'
import prisma from '@/lib/core/prisma'
import { updateUserRequestModel, UserResponseDto } from '@/types/user'

/**
 * 특정 사용자 정보 수정
 **/

async function updateUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireManagerOrAdmin(req)
  const { id } = await params
  await findUserOrThrow(id)

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
 * (소프트 삭제)
 **/
async function deleteUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireManagerOrAdmin(req)
  const { id } = await params
  await findUserOrThrow(id)

  if (currentUser.id === id) {
    throw new ApiError('자기 자신은 탈퇴할 수 없습니다.', 400, 'SELF')
  }

  const deleteUser = await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
      deactivatedAt: new Date(),
    },
  })

  return ApiResponseFactory.success(deleteUser, '사용자가 비활성화되었습니다.')
}
export const DELETE = withErrorHandler(deleteUser)
