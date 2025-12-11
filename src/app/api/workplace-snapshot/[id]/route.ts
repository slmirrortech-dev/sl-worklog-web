import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { ApiError } from '@/lib/core/errors'
import { WorkplaceSnapshotDetailResponse } from '@/types/workplace-snapshot'

/**
 * 특정 작업장 현황 스냅샷 상세 조회
 * 엑셀 다운로드를 위한 전체 데이터 포함
 **/
async function getWorkplaceSnapshotDetail(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const { id } = await params

  // 스냅샷 조회
  const snapshot = await prisma.workplaceSnapshot.findUnique({
    where: { id },
  })

  if (!snapshot) {
    throw new ApiError('스냅샷을 찾을 수 없습니다.', 404, 'NOT_FOUND')
  }

  const response: WorkplaceSnapshotDetailResponse = {
    id: snapshot.id,
    snapshotDate: snapshot.snapshotDate,
    snapshotTime: snapshot.snapshotTime,
    recordCount: snapshot.recordCount,
    createdAt: snapshot.createdAt.toISOString(),
    createdBy: snapshot.createdBy,
    data: snapshot.data as any, // JSON 데이터 (WorkplaceSnapshotRow[])
  }

  return ApiResponseFactory.success(response, '스냅샷 상세 정보를 가져왔습니다.')
}

export const GET = withErrorHandler(getWorkplaceSnapshotDetail)
