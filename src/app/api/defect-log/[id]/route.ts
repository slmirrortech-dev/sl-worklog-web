import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { findUserOrThrow } from '@/lib/service/user.servie'
import { DefectLogResponse } from '@/types/defect-log'

/**
 * 특정 작업자의 불량유출 이력 가져오기
 **/
async function getWorkersDefectLog(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  // 존재하는 아이디 인지 확인
  const { id } = await params
  await findUserOrThrow(id)

  const defectLogs = await prisma.defectLog.findMany({
    where: {
      workerId: id,
    },
    orderBy: {
      occurredAt: 'desc',
    },
    include: {
      worker: true,
    },
  })

  const response = defectLogs.map((log) => ({
    id: log.id,
    occurredAt: log.occurredAt.toISOString(),
    workerName: log.worker.name,
    workerUserId: log.worker.userId,
    lineName: log.lineName,
    shiftType: log.shiftType,
    processName: log.processName,
    memo: log.memo,
  })) as DefectLogResponse[]

  return ApiResponseFactory.success(response, '작업자 불량 유출 이력을 가져왔습니다.')
}

export const GET = withErrorHandler(getWorkersDefectLog)
