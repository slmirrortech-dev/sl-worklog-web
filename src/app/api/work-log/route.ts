import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireUser } from '@/lib/utils/auth-guards'
import prisma from '@/lib/core/prisma'
import { ApiError } from '@/lib/core/errors'
import { addWorkLogResponseModel } from '@/types/work-log'

/** 작업 기록 */
async function addWorkLog(req: NextRequest) {
  // 로그인한 사용자인지 확인
  const currentUser = await requireUser(req)

  const { startedAt, processShiftId }: { startedAt: Date; processShiftId: string } =
    await req.json()

  let waitingWorkerId

  try {
    const res = await prisma.processShift.findUniqueOrThrow({
      where: { id: processShiftId },
      select: { waitingWorkerId: true },
    })

    waitingWorkerId = res.waitingWorkerId
  } catch (err) {
    throw new ApiError('존재하지 않는 작업장입니다.', 404, 'NOT_FOUND_PROCESS_SHIFT')
  }

  // 해당 작업장에 배정된 작업자가 없을 경우
  if (waitingWorkerId === null) {
    throw new ApiError('해당 작업장에 배정된 사용자가 없습니다.', 422, 'NO_WAITING_WORKER_ASSIGNED')
  }

  // 다른 작업자가 배정되어 있는 경우
  if (waitingWorkerId !== currentUser.id) {
    throw new ApiError(
      '해당 작업장은 현재 사용자에게 배정되지 않았습니다.',
      403,
      'NOT_ASSIGNED_TO_THIS_WORKSTATION',
    )
  }

  // 작업 시작 전에 중복 확인
  const existing = await prisma.workLog.findFirst({
    where: {
      userId: currentUser.id,
      processShiftId,
      endedAt: null, // 아직 종료되지 않은 기록
    },
  })

  if (existing) {
    throw new ApiError(
      '이미 진행 중인 작업이 있습니다. 종료 후 다시 시작하세요.',
      409,
      'WORK_ALREADY_IN_PROGRESS',
    )
  }

  const result = (await prisma.workLog.create({
    data: {
      userId: currentUser.id,
      userUserId: currentUser.userId,
      userName: currentUser.name,
      startedAt: startedAt,
      processShiftId: processShiftId,
    },
  })) as addWorkLogResponseModel

  return ApiResponseFactory.success(result, '작업자 작업 기록을 추가했습니다.')
}

export const POST = withErrorHandler(addWorkLog)
