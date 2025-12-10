import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

/**
 * 백업 스케줄 목록 조회
 * GET /api/backup-schedule
 */
async function getBackupSchedules(request: NextRequest) {
  // 권한 확인 (관리자만)
  await requireAdmin(request)

  const schedules = await prisma.backupSchedule.findMany({
    orderBy: { time: 'asc' },
  })

  return ApiResponseFactory.success(
    schedules.map((s) => ({ id: s.id, time: s.time })),
    '백업 스케줄 목록을 가져왔습니다.',
  )
}

/**
 * 백업 스케줄 업데이트 (전체 교체)
 * PUT /api/backup-schedule
 * Body: { times: string[] } - 예: ["08:00", "20:00"]
 */
async function updateBackupSchedules(request: NextRequest) {
  // 권한 확인 (관리자만)
  await requireAdmin(request)

  const body = await request.json()
  const { times } = body as { times: string[] }

  // 유효성 검사
  if (!Array.isArray(times)) {
    return ApiResponseFactory.error('times는 배열이어야 합니다.', 400)
  }

  // HH:mm 형식 검증
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  for (const time of times) {
    if (!timeRegex.test(time)) {
      return ApiResponseFactory.error(
        `잘못된 시간 형식입니다: ${time} (HH:mm 형식이어야 합니다)`,
        400,
      )
    }
  }

  // 중복 제거
  const uniqueTimes = Array.from(new Set(times))

  // 트랜잭션으로 전체 교체
  await prisma.$transaction(async (tx) => {
    // 기존 스케줄 모두 삭제
    await tx.backupSchedule.deleteMany({})

    // 새 스케줄 생성
    if (uniqueTimes.length > 0) {
      await tx.backupSchedule.createMany({
        data: uniqueTimes.map((time) => ({ time })),
      })
    }
  })

  // 업데이트된 스케줄 조회
  const updatedSchedules = await prisma.backupSchedule.findMany({
    orderBy: { time: 'asc' },
  })

  return ApiResponseFactory.success(
    updatedSchedules.map((s) => ({ id: s.id, time: s.time })),
    '백업 스케줄이 업데이트되었습니다.',
  )
}

export const GET = withErrorHandler(getBackupSchedules)
export const PUT = withErrorHandler(updateBackupSchedules)
