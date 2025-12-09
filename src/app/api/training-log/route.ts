import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { findUserOrThrow } from '@/lib/service/user.servie'
import { TrainingLogCreateRequest } from '@/types/training-log'

/**
 * 교육 이력 생성
 */
async function createTrainingLog(request: NextRequest) {
  // 권한 확인
  const { id } = await requireManagerOrAdmin(request)

  // body 파싱
  const body = (await request.json()) as TrainingLogCreateRequest

  const { trainedAt, workerId, title, instructor } = body

  // 필수 값 검증
  if (!workerId || !trainedAt || !title || !instructor) {
    throw new Error('필수 입력 값이 누락되었습니다.')
  }

  // 작업자 존재 여부 확인
  await findUserOrThrow(workerId)

  // 생성
  const trainingLog = await prisma.trainingLog.create({
    data: {
      trainedAt: new Date(trainedAt),
      workerId,
      title,
      instructor,
      createdBy: id,
    },
  })

  return ApiResponseFactory.success(trainingLog.id, '교육 이력이 등록되었습니다.')
}

export const POST = withErrorHandler(createTrainingLog)