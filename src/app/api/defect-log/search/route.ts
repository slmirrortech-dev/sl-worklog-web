import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

/**
 * 불량유출 이력 가져오기
 **/
async function getDefectLog(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const defectLog = await prisma.defectLog.findMany({})

  return ApiResponseFactory.success(defectLog, '불량 유출 이력을 가져왔습니다.')
}

export const GET = withErrorHandler(getDefectLog)
