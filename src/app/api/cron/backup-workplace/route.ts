import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'
import { WorkplaceSnapshotRow } from '@/types/workplace-snapshot'

export const runtime = 'nodejs'

/**
 * 작업장 현황 자동 백업 Cron
 *
 * Vercel Cron에서 주기적으로 호출하여 작업장 현황을 자동으로 백업합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 요청 검증 (보안)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
      반이름: slot.shift.line.workClass.name,
      라인이름: slot.shift.line.name,
      공정이름: slot.name,
      교대조타입: slot.shift.type,
      라인상태: slot.shift.status,
      작업자이름: slot.worker?.name || null,
      사번: slot.worker?.userId || null,
      작업자상태: slot.workerStatus,
    }))

    // 스냅샷 저장 (자동 백업이므로 createdBy는 null)
    const snapshot = await prisma.workplaceSnapshot.create({
      data: {
        data: snapshotData as any,
        createdByUserId: null,
        createdByUserName: null,
        createdByUserUserId: null,
      },
    })

    return NextResponse.json({
      ok: true,
      message: '자동 백업 성공',
      snapshotId: snapshot.id,
      recordCount: snapshotData.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('자동 백업 실패:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
