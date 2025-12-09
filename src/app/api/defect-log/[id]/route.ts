import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

/**
 * 특정 작업 삭제
 **/
async function deleteDefectLog(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  // 삭제하려는 작업 id
  const { id } = await params

  await prisma.defectLog.delete({ where: { id: id } })

  return ApiResponseFactory.success(id, '해당 id의 불량 유출 기록을 삭제했습니다.')
}

export const DELETE = withErrorHandler(deleteDefectLog)
