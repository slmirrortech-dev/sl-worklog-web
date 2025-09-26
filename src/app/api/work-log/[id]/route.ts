import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import prisma from '@/lib/core/prisma'
import { WorkLogSnapshotResponseModel } from '@/types/work-log'

/** 특정 작업 기록 조회 */
async function getUniqueWorkLog(req: NextRequest, { params }: { params: { id: string } }) {
  await requireManagerOrAdmin(req)

  // 경로 파라미터에서 ID 추출
  const idParam = params.id

  const workLogs = (await prisma.workLog.findUnique({
    where: {
      id: idParam!,
    },
    select: {
      id: true,
      userId: true,
      userUserId: true,
      userName: true,
      startedAt: true,
      endedAt: true,
      durationMinutes: true,
      isDefective: true,
      processName: true,
      lineName: true,
      lineClassNo: true,
      shiftType: true,
      workStatus: true,
      memo: true,
      histories: true,
    },
  })) as WorkLogSnapshotResponseModel

  return ApiResponseFactory.success<{
    workLogs: WorkLogSnapshotResponseModel
  }>({ workLogs: workLogs }, '작업 기록을 조회했습니다.')
}

export const GET = withErrorHandler(getUniqueWorkLog)
