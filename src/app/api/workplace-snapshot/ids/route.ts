import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

/**
 * 작업장 현황 스냅샷 ID 목록 조회 (전체 선택용)
 * 검색 조건: startDate, endDate
 **/
async function getWorkplaceSnapshotIds(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  // 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // where 조건 동적 구성
  const where: any = {}

  // 날짜 범위 검색 (createdAt 기준)
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate + 'T23:59:59'),
    }
  } else if (startDate) {
    where.createdAt = {
      gte: new Date(startDate),
    }
  } else if (endDate) {
    where.createdAt = {
      lte: new Date(endDate + 'T23:59:59'),
    }
  }

  // ID만 조회
  const snapshots = await prisma.workplaceSnapshot.findMany({
    where,
    select: { id: true },
    orderBy: { createdAt: 'desc' },
  })

  const ids = snapshots.map((s) => s.id)

  return ApiResponseFactory.success(
    { ids, totalCount: ids.length },
    `${ids.length}개의 스냅샷 ID를 가져왔습니다.`,
  )
}

export const GET = withErrorHandler(getWorkplaceSnapshotIds)
