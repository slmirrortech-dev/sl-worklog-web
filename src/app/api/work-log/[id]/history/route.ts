import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import prisma from '@/lib/core/prisma'
import { workLogHistoryResponseDto, WorkLogResponseModel } from '@/types/work-log'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { withErrorHandler } from '@/lib/core/api-handler'

/** 특정 작업 기록 히스토리 조회 */
async function getUniqueWorkLogHistory(req: NextRequest, { params }: { params: { id: string } }) {
  await requireManagerOrAdmin(req)

  // 경로 파라미터에서 ID 추출
  const idParam = params.id

  const workLogHistory = (await prisma.workLogHistory.findMany({
    where: {
      workLogId: idParam!,
    },
    orderBy: { changedAt: 'desc' },
  })) as workLogHistoryResponseDto[]

  return ApiResponseFactory.success<workLogHistoryResponseDto[]>(
    workLogHistory,
    '작업의 변경 이력을 조회했습니다.',
  )
}

export const GET = withErrorHandler(getUniqueWorkLogHistory)
