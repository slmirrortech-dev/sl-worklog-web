import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import prisma from '@/lib/core/prisma'
import { WorkLogResponseModel } from '@/types/work-log'
import { ShiftType } from '@prisma/client'

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
  })) as WorkLogResponseModel

  return ApiResponseFactory.success<{
    workLogs: WorkLogResponseModel
  }>({ workLogs: workLogs }, '작업 기록을 조회했습니다.')
}

export const GET = withErrorHandler(getUniqueWorkLog)

/** 특정 작업 기록 수정 */
async function updateUniqueWorkLog(req: NextRequest, { params }: { params: { id: string } }) {
  await requireManagerOrAdmin(req)

  // 경로 파라미터에서 ID 추출
  const idParam = params.id

  const body: {
    processId: string
    shiftType: ShiftType
    usersUuid: string
  } = await req.json()

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
  })) as WorkLogResponseModel

  return ApiResponseFactory.success<{
    workLogs: WorkLogResponseModel
  }>({ workLogs: workLogs }, '작업 기록을 수정했습니다.')
}

export const PUT = withErrorHandler(updateUniqueWorkLog)
