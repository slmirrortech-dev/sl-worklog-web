import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { findUserOrThrow } from '@/lib/service/user.servie'
import { DefectLogCreateRequest } from '@/types/defect-log'

/**
 * 선택된 ID로 불량 유출 이력 조회 (엑셀 다운로드용)
 */
async function getDefectLogsByIds(request: NextRequest) {
  await requireManagerOrAdmin(request)

  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    throw new Error('ID 목록이 필요합니다.')
  }

  const ids = idsParam.split(',')

  const defectLogs = await prisma.defectLog.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      worker: {
        select: {
          userId: true,
          name: true,
        },
      },
    },
    orderBy: {
      occurredAt: 'desc',
    },
  })

  const response = defectLogs.map((log) => ({
    id: log.id,
    occurredAt: log.occurredAt,
    workerName: log.worker.name,
    workerUserId: log.worker.userId,
    lineName: log.lineName,
    className: log.className,
    shiftType: log.shiftType,
    processName: log.processName,
    memo: log.memo,
  }))

  return ApiResponseFactory.success(response)
}

/**
 * 불량 유출 이력 생성
 */
async function createDefectLog(request: NextRequest) {
  // 권한 확인
  const { id } = await requireManagerOrAdmin(request)

  // body 파싱
  const body = (await request.json()) as DefectLogCreateRequest

  const { occurredAt, workerId, lineName, className, shiftType, processName, memo } = body

  // 필수 값 검증
  if (!workerId || !occurredAt || !lineName || !className || !shiftType || !processName) {
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
      className,
      shiftType,
      processName,
      memo,
      createdBy: id,
    },
  })

  return ApiResponseFactory.success(defectLog.id, '불량 유출 이력이 등록되었습니다.')
}

export const GET = withErrorHandler(getDefectLogsByIds)
export const POST = withErrorHandler(createDefectLog)
