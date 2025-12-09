import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { findUserOrThrow } from '@/lib/service/user.servie'
import { DefectLogCreateRequest } from '@/types/defect-log'

/**
 * 불량 유출 이력 생성
 */
async function createDefectLog(request: NextRequest) {
  // 권한 확인
  const { id } = await requireManagerOrAdmin(request)

  // body 파싱
  const body = (await request.json()) as DefectLogCreateRequest

  const { occurredAt, workerId, lineName, shiftType, processName, memo } = body

  // 필수 값 검증
  if (!workerId || !occurredAt || !lineName || !shiftType || !processName) {
    throw new Error('필수 입력 값이 누락되었습니다.')
  }

  // 작업자 존재 여부 확인
  await findUserOrThrow(workerId)

  // 생성
  const defectLog = await prisma.defectLog.create({
    data: {
      occurredAt: new Date(occurredAt),
      workerId,
      lineName,
      shiftType,
      processName,
      memo,
      createdBy: id,
    },
  })

  return ApiResponseFactory.success(defectLog.id, '불량 유출 이력이 등록되었습니다.')
}

export const POST = withErrorHandler(createDefectLog)
