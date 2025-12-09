import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { ShiftType } from '@prisma/client'
import { DefectLogResponse } from '@/types/defect-log'

/**
 * 불량유출 이력 검색
 * 검색 조건: startDate, endDate, workerSearch, lineName, processName, shiftType, memo
 **/
async function searchDefectLog(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  // 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const workerSearch = searchParams.get('workerSearch')
  const lineName = searchParams.get('lineName')
  const processName = searchParams.get('processName')
  const shiftType = searchParams.get('shiftType') as ShiftType | null
  const memo = searchParams.get('memo')

  // where 조건 동적 구성
  const where: any = {}

  // 날짜 범위 검색
  if (startDate || endDate) {
    where.occurredAt = {}
    if (startDate) {
      where.occurredAt.gte = new Date(startDate)
    }
    if (endDate) {
      where.occurredAt.lte = new Date(endDate)
    }
  }

  // 작업자 이름 또는 사번 검색
  if (workerSearch) {
    where.worker = {
      OR: [
        { name: { contains: workerSearch } },
        { userId: { contains: workerSearch } },
      ],
    }
  }

  // 라인명 검색
  if (lineName) {
    where.lineName = { contains: lineName }
  }

  // 공정명 검색
  if (processName) {
    where.processName = { contains: processName }
  }

  // 교대조 검색
  if (shiftType) {
    where.shiftType = shiftType
  }

  // 메모 내용 검색
  if (memo) {
    where.memo = { contains: memo }
  }

  const defectLogs = await prisma.defectLog.findMany({
    where,
    orderBy: {
      occurredAt: 'desc',
    },
    include: {
      worker: true,
    },
  })

  const response = defectLogs.map((log) => ({
    id: log.id,
    occurredAt: log.occurredAt.toISOString(),
    workerName: log.worker.name,
    workerUserId: log.worker.userId,
    lineName: log.lineName,
    shiftType: log.shiftType,
    processName: log.processName,
    memo: log.memo,
  })) as DefectLogResponse[]

  return ApiResponseFactory.success(response, '불량 유출 이력을 가져왔습니다.')
}

export const GET = withErrorHandler(searchDefectLog)
