import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { ApiError } from '@/lib/core/errors'
import { WorkStatus } from '@prisma/client'

export const runtime = 'nodejs'

/**
 * LineShift 상태 업데이트
 */
async function updateShiftStatus(req: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(req)

  const {
    shiftId,
    status,
  }: {
    shiftId: string
    status: WorkStatus
  } = await req.json()

  // 유효성 검사
  if (!shiftId || !status) {
    throw new ApiError('shiftId와 status는 필수입니다', 400, 'INVALID_INPUT')
  }

  // status 값 검증
  if (!['NORMAL', 'OVERTIME', 'EXTENDED'].includes(status)) {
    throw new ApiError('올바르지 않은 status 값입니다', 400, 'INVALID_STATUS')
  }

  // LineShift 업데이트
  const updatedShift = await prisma.lineShift.update({
    where: { id: shiftId },
    data: { status },
    include: {
      line: true,
    },
  })

  return ApiResponseFactory.success(
    updatedShift,
    `${updatedShift.line.name} - ${updatedShift.type === 'DAY' ? '주간' : '야간'} 상태를 변경했습니다.`,
  )
}

export const PUT = withErrorHandler(updateShiftStatus)
