import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { findUserOrThrow } from '@/lib/service/user.servie'
import { TrainingLogResponse } from '@/types/training-log'

/**
 * 특정 작업자의 교육 이력 가져오기
 **/
async function getWorkersTrainingLog(
  request: NextRequest,
  { params }: { params: Promise<{ workerId: string }> },
) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  // 존재하는 아이디 인지 확인
  const { workerId } = await params
  await findUserOrThrow(workerId)

  const trainingLogs = await prisma.trainingLog.findMany({
    where: {
      workerId: workerId,
    },
    orderBy: {
      trainedAt: 'desc',
    },
  })

  const response = trainingLogs.map((log) => ({
    id: log.id,
    trainedAt: log.trainedAt.toISOString(),
    title: log.title,
    instructor: log.instructor,
  })) as TrainingLogResponse[]

  return ApiResponseFactory.success(response, '작업자 교육 이력을 가져왔습니다.')
}

export const GET = withErrorHandler(getWorkersTrainingLog)
