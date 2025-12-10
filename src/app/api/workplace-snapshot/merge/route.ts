import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import {
  WorkplaceSnapshotRow,
  WorkplaceSnapshotRowWithBackupTime,
} from '@/types/workplace-snapshot'

/**
 * 선택된 여러 스냅샷을 병합하여 데이터 반환
 * GET /api/workplace-snapshot/merge?ids=id1,id2,id3
 **/
async function getMergedSnapshots(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  // 쿼리 파라미터에서 스냅샷 ID 배열 추출
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return ApiResponseFactory.error('스냅샷 ID를 지정해주세요.', 400)
  }

  const ids = idsParam.split(',').filter(Boolean)

  if (ids.length === 0) {
    return ApiResponseFactory.error('선택된 스냅샷이 없습니다.', 400)
  }

  // 선택된 스냅샷들 조회
  const snapshots = await prisma.workplaceSnapshot.findMany({
    where: {
      id: { in: ids },
    },
    orderBy: { createdAt: 'asc' }, // 시간순 정렬
  })

  if (snapshots.length === 0) {
    return ApiResponseFactory.error('해당하는 스냅샷을 찾을 수 없습니다.', 404)
  }

  // 모든 스냅샷의 데이터를 병합 (백업일시 정보 포함)
  const mergedData: WorkplaceSnapshotRowWithBackupTime[] = []

  snapshots.forEach((snapshot) => {
    const data = snapshot.data as WorkplaceSnapshotRow[]
    const backupTime = snapshot.createdAt.toISOString()

    if (Array.isArray(data)) {
      data.forEach((row) => {
        mergedData.push({
          ...row,
          백업일시: backupTime,
        })
      })
    }
  })

  // 정렬: 백업일시 → 반 → 라인순서 → 교대조(주간 우선) → 공정순서
  mergedData.sort((a, b) => {
    // 1. 백업일시 (날짜, 시간 순)
    const timeCompare = a.백업일시.localeCompare(b.백업일시)
    if (timeCompare !== 0) return timeCompare

    // 2. 반 이름
    const classCompare = a.반.localeCompare(b.반)
    if (classCompare !== 0) return classCompare

    // 3. 라인 순서 (displayOrder)
    const lineOrderCompare = a.라인순서 - b.라인순서
    if (lineOrderCompare !== 0) return lineOrderCompare

    // 4. 교대조 (DAY 우선)
    const shiftCompare = a.교대조 === 'DAY' ? -1 : b.교대조 === 'DAY' ? 1 : 0
    if (shiftCompare !== 0) return shiftCompare

    // 5. 공정 순서 (slotIndex)
    return a.공정순서 - b.공정순서
  })

  return ApiResponseFactory.success(
    {
      data: mergedData,
      snapshotCount: snapshots.length,
      totalRecords: mergedData.length,
    },
    `${snapshots.length}개 스냅샷의 데이터를 병합했습니다.`,
  )
}

export const GET = withErrorHandler(getMergedSnapshots)
