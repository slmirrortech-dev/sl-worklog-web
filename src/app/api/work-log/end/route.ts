import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireUser } from '@/lib/utils/auth-guards'
import prisma from '@/lib/core/prisma'
import { endWorkLogRequestModel, workLogResponseModel } from '@/types/work-log'

/** 작업 기록 */
async function endWorkLog(req: NextRequest) {
  const currentUser = await requireUser(req)
  const { endedAt, workLogId }: endWorkLogRequestModel = await req.json()

  // DB 에서 startedAt 조회
  const workLog = await prisma.workLog.findFirstOrThrow({
    where: {
      id: workLogId,
      userId: currentUser.id,
    },
    select: {
      startedAt: true,
    },
  })

  // duration 계산 (분 단위)
  const durationMinutes = Math.floor(
    (new Date(endedAt).getTime() - new Date(workLog.startedAt).getTime()) / 1000 / 60,
  )

  const result = (await prisma.workLog.update({
    where: {
      id: workLogId,
      userId: currentUser.id,
    },
    data: {
      endedAt: endedAt,
      durationMinutes: durationMinutes,
    },
  })) as workLogResponseModel

  return ApiResponseFactory.success(result, '작업의 종료시간을 기록했습니다.')
}

export const PUT = withErrorHandler(endWorkLog)
