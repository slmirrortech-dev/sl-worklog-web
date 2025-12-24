import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { WorkplaceSnapshotResponse, WorkplaceSnapshotRow } from '@/types/workplace-snapshot'

/**
 * 작업장 현황 스냅샷 목록 조회
 * 검색 조건: startDate, endDate
 * 페이징: page, pageSize
 **/
async function getWorkplaceSnapshots(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  // 쿼리 파라미터 추출
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // 페이징 파라미터
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10)
  const skip = (page - 1) * pageSize

  // where 조건 동적 구성
  const where: any = {}

  // 날짜 범위 검색 (createdAt 기준)
  // 프론트엔드에서 "yyyy-MM-dd HH:mm:ss" 형식으로 전달됨
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }
  } else if (startDate) {
    where.createdAt = {
      gte: new Date(startDate),
    }
  } else if (endDate) {
    where.createdAt = {
      lte: new Date(endDate),
    }
  }

  // 총 개수 조회
  const totalCount = await prisma.workplaceSnapshot.count({ where })

  // 페이징된 데이터 조회
  const snapshots = await prisma.workplaceSnapshot.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: pageSize,
  })

  const data = snapshots.map((snapshot) => {
    const snapshotData = snapshot.data as WorkplaceSnapshotRow[]
    return {
      id: snapshot.id,
      recordCount: Array.isArray(snapshotData) ? snapshotData.length : 0,
      createdAt: snapshot.createdAt.toISOString(),
      createdByUserName: snapshot.createdByUserName,
      createdByUserUserId: snapshot.createdByUserUserId,
    }
  }) as WorkplaceSnapshotResponse[]

  return ApiResponseFactory.success(
    {
      data,
      totalCount,
      page,
      pageSize,
    },
    '작업장 현황 스냅샷 목록을 가져왔습니다.',
  )
}

/**
 * 작업장 현황 스냅샷 생성
 * 현재 작업장의 모든 ProcessSlot + 상위 관계 정보를 캡처하여 저장
 **/
async function createWorkplaceSnapshot(request: NextRequest) {
  // 권한 확인
  const session = await requireManagerOrAdmin(request)

  // 모든 ProcessSlot + 상위 관계 정보 조회
  const processSlots = await prisma.processSlot.findMany({
    include: {
      shift: {
        include: {
          line: {
            include: {
              workClass: true,
            },
          },
        },
      },
      worker: true,
    },
  })

  // WorkplaceSnapshotRow 형식으로 변환
  const snapshotData: WorkplaceSnapshotRow[] = processSlots.map((slot) => ({
    반: slot.shift.line.workClass.name,
    라인: slot.shift.line.name,
    교대조: slot.shift.type,
    라인상태: slot.shift.status,
    공정: slot.name,
    작업자: slot.worker?.name || null,
    사번: slot.worker?.userId || null,
    작업자상태: slot.worker ? slot.workerStatus : null,
    라인순서: slot.shift.line.displayOrder,
    공정순서: slot.slotIndex,
  }))

  // 스냅샷 저장
  const snapshot = await prisma.workplaceSnapshot.create({
    data: {
      data: snapshotData as any,
      createdByUserId: session.id,
      createdByUserName: session.name,
      createdByUserUserId: session.userId,
    },
  })

  return ApiResponseFactory.success(
    {
      id: snapshot.id,
      recordCount: snapshotData.length,
      createdAt: snapshot.createdAt.toISOString(),
      createdByUserName: snapshot.createdByUserName,
      createdByUserUserId: snapshot.createdByUserUserId,
    },
    '작업장 현황 스냅샷이 생성되었습니다.',
    201,
  )
}

export const GET = withErrorHandler(getWorkplaceSnapshots)
export const POST = withErrorHandler(createWorkplaceSnapshot)
