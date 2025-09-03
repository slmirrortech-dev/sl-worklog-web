import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import type { UserDto } from '@/types/dto/user.dto'
import { ApiResponse } from '@/lib/response'
import { ApiError } from '@/lib/errors'
import { withErrorHandler } from '@/lib/api-handler'
import { findUserOrThrow } from '@/lib/service/user.servie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const userSelect: Record<keyof UserDto, true> = {
  id: true,
  loginId: true,
  name: true,
  role: true,
  isActive: true,
  licensePhoto: true,
  createdAt: true,
  updatedAt: true,
}

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 특정 사용자 조회
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
 *                 message:
 *                   type: string
 *                   example: 사용자 조회 성공
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
async function getUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(req)
  const { id } = await params
  const user = await findUserOrThrow(id)
  return ApiResponse.success(user, '사용자 조회 성공')
}
export const GET = withErrorHandler(getUser)

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
 *             $ref: '#/components/schemas/User'
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
 *                 message:
 *                   type: string
 *                   example: 사용자 수정 성공
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 입력
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
async function updateUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireAdmin(req)
  const body = await req.json().catch(() => ({}))
  const { id } = await params

  await findUserOrThrow(id)

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.role !== undefined) data.role = body.role
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.licensePhoto !== undefined) data.licensePhoto = body.licensePhoto

  if (Object.keys(data).length === 0) {
    throw new ApiError('수정할 값이 없습니다', 400, 'NO_UPDATE')
  }

  if (currentUser.id === id && body.role === 'WORKER') {
    throw new ApiError('자기 자신을 작업자로 변경할 수 없습니다.', 400, 'SELF_DOWNGRADE')
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  })

  return ApiResponse.success(updated, '사용자 수정 성공')
}
export const PATCH = withErrorHandler(updateUser)

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
 *                 message:
 *                   type: string
 *                   example: 사용자 삭제 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: clx123abc
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
async function deleteUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(req)
  const { id } = await params
  await findUserOrThrow(id)

  await prisma.user.delete({ where: { id } })
  return ApiResponse.success({ id }, '사용자 삭제 성공')
}
export const DELETE = withErrorHandler(deleteUser)
