import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireManagerOrAdmin, requireUser } from '@/lib/utils/auth-guards'
import prisma from '@/lib/core/prisma'
import { ApiError } from '@/lib/core/errors'
import { WorkLogResponseModel } from '@/types/work-log'
import { fromZonedTime } from 'date-fns-tz'
import { endOfDay, startOfDay } from 'date-fns'

/** 전체 작업 기록 조회 */
async function getWorkLog(req: NextRequest) {
  await requireManagerOrAdmin(req)

  const { searchParams } = req.nextUrl

  // 쿼리 파라미터
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')
  const shiftType = searchParams.get('shiftType')
  const workStatus = searchParams.get('workStatus')
  const lineName = searchParams.get('lineName')
  const lineClassNo = searchParams.get('lineClassNo')
  const processName = searchParams.get('processName')
  const isDefective = searchParams.get('isDefective')
  const searchName = searchParams.get('searchName')
  const progress = searchParams.get('progress')
  const skip = parseInt(searchParams.get('skip') || '0', 10)
  const take = parseInt(searchParams.get('take') || '10', 10)

  // 한국시간(KST) - UTC 변환
  const timeZone = 'Asia/Seoul'
  const startKST = startOfDay(new Date(startDateParam!))
  const endKST = endOfDay(new Date(endDateParam!))

  // UTC 변환
  const startUTC = fromZonedTime(startKST, timeZone)
  const endUTC = fromZonedTime(endKST, timeZone)

  const where: any = {
    startedAt: { lte: endUTC },
    OR: [{ endedAt: null }, { endedAt: { gte: startUTC } }],
  }

  if (progress === 'END') {
    where.AND = { endedAt: { not: null } }
  }
  if (progress === 'NOT_END') {
    where.AND = { endedAt: null }
  }

  if (shiftType) where.shiftType = shiftType
  if (workStatus) where.workStatus = workStatus
  if (lineName) where.lineName = { contains: lineName, mode: 'insensitive' }
  if (lineClassNo) where.lineClassNo = parseInt(lineClassNo, 10)
  if (processName) where.processName = { contains: processName, mode: 'insensitive' }
  if (isDefective !== null) where.isDefective = isDefective === 'true'
  if (searchName) {
    where.OR = [
      { userUserId: { contains: searchName, mode: 'insensitive' } }, // 사번 스냅샷
      { userName: { contains: searchName, mode: 'insensitive' } }, // 이름 스냅샷
    ]
  }

  const workLogs = (await prisma.workLog.findMany({
    where,
    skip,
    take,
    orderBy: [{ startedAt: 'desc' }, { endedAt: 'desc' }],
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

  const totalCount = await prisma.workLog.count({ where })

  return ApiResponseFactory.success<{
    workLogs: WorkLogResponseModel[]
    totalCount: number
  }>({ workLogs: workLogs, totalCount }, '작업 기록을 조회했습니다.')
}

export const GET = withErrorHandler(getWorkLog)

/** 작업 기록 추가 */
async function addWorkLog(req: NextRequest) {
  const currentUser = await requireUser(req)
  const { startedAt, processShiftId }: { startedAt: Date; processShiftId: string } =
    await req.json()

  // processShift + process + line 정보 조회 (스냅샷용)
  const processShift = await prisma.processShift.findUnique({
    where: { id: processShiftId },
    include: {
      process: {
        include: {
          line: true,
        },
      },
    },
  })

  if (!processShift) {
    throw new ApiError('존재하지 않는 작업장입니다.', 404, 'NOT_FOUND_PROCESS_SHIFT')
  }

  // 대기자 확인
  if (!processShift.waitingWorkerId) {
    throw new ApiError('해당 작업장에 배정된 사용자가 없습니다.', 422, 'NO_WAITING_WORKER_ASSIGNED')
  }
  if (processShift.waitingWorkerId !== currentUser.id) {
    throw new ApiError(
      '해당 작업장은 현재 사용자에게 배정되지 않았습니다.',
      403,
      'NOT_ASSIGNED_TO_THIS_WORKSTATION',
    )
  }

  // 중복 작업 방지
  const existing = await prisma.workLog.findFirst({
    where: { userId: currentUser.id, endedAt: null },
  })
  if (existing) {
    throw new ApiError(
      '이미 진행 중인 작업이 있습니다. 종료 후 다시 시작하세요.',
      409,
      'WORK_ALREADY_IN_PROGRESS',
    )
  }

  // WorkLog 생성 (스냅샷 저장)
  const result = await prisma.workLog.create({
    data: {
      userId: currentUser.id,
      userUserId: currentUser.userId,
      userName: currentUser.name,
      startedAt,
      processShiftId,
      processName: processShift.process.name,
      lineName: processShift.process.line.name,
      lineClassNo: processShift.process.line.classNo,
      shiftType: processShift.type,
      workStatus: processShift.status,
    },
  })

  return ApiResponseFactory.success(result, '작업자 작업 기록을 추가했습니다.')
}

export const POST = withErrorHandler(addWorkLog)
