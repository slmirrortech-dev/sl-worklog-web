import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'
import { WorkplaceSnapshotRow } from '@/types/workplace-snapshot'

export const runtime = 'nodejs'

/**
 * 작업장 현황 자동 백업 Cron
 *
 * Supabase pg_cron에서 정확한 시간에 호출됩니다.
 * pg_cron이 이미 시간 판단을 완료했으므로, 이 API는 무조건 백업만 실행합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // pg_cron 요청 검증 (보안)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    // pg_cron이 정확한 시간에만 호출하므로, 바로 백업 실행
    console.log('[Cron] 자동 백업 시작')

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
      { status: 500 },
    )
  }
}
