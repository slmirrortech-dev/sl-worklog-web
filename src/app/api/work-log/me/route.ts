import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireUser } from '@/lib/utils/auth-guards'
import prisma from '@/lib/core/prisma'
import { WorkLogResponseDto, WorkLogResponseModel } from '@/types/work-log'
import { startOfDay, endOfDay } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { ApiError } from '@/lib/core/errors'

/** 로그인한 작업자의 작업 기록 조회 */
async function getMyWorkLog(req: NextRequest) {
  // 로그인한 사용자인지 확인
  const currentUser = await requireUser(req)

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  if (!date) {
    throw new ApiError('검색 날짜 필요')
  }

  // 한국시간(KST) 기준으로 하루의 시작/끝 계산
  const timeZone = 'Asia/Seoul'
  const baseDate = new Date(date) // yyyy-MM-dd

  const startKST = startOfDay(baseDate)
  const endKST = endOfDay(baseDate)

  // Prisma는 UTC 기반이므로 KST 에서 UTC 변환
  const startUTC = fromZonedTime(startKST, timeZone)
  const endUTC = fromZonedTime(endKST, timeZone)

  const workLogs = (await prisma.workLog.findMany({
    where: {
      userId: currentUser.id,
      OR: [
        { startedAt: { gte: startUTC, lte: endUTC } },
        { endedAt: { gte: startUTC, lte: endUTC } },
      ],
    },
    orderBy: { startedAt: 'asc' },
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
  })) as WorkLogResponseModel[]

  return ApiResponseFactory.success<WorkLogResponseModel[]>(workLogs, '작업 기록을 조회했습니다.')
}

export const GET = withErrorHandler(getMyWorkLog)
