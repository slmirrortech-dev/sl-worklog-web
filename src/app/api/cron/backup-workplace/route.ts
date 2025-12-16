import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/core/prisma'
import { WorkplaceSnapshotRow } from '@/types/workplace-snapshot'
import { toZonedTime, format } from 'date-fns-tz'

export const runtime = 'nodejs'

/**
 * 작업장 현황 자동 백업 Cron
 *
 * Vercel Cron에서 매분 호출되며, backup_schedules 테이블의 설정된 시간과 일치하면 백업을 실행합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 요청 검증 (보안)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 현재 한국 시간(KST) 가져오기
    const now = new Date()
    const kstTime = toZonedTime(now, 'Asia/Seoul')
    const currentTime = format(kstTime, 'HH:mm')

    // backup_schedules 테이블에서 설정된 시간 확인
    const schedules = await prisma.backupSchedule.findMany()

    // 현재 시간과 일치하는 스케줄이 있는지 확인
    const shouldBackup = schedules.some((schedule) => schedule.time === currentTime)

    if (!shouldBackup) {
      // 백업 시간이 아니면 아무것도 하지 않고 종료
      return NextResponse.json({
        ok: true,
        message: '백업 시간이 아님',
        currentTime,
        schedules: schedules.map((s) => s.time),
      })
    }

    // 백업 시간이면 백업 실행
    console.log(`[Cron] 자동 백업 시작 - 현재 시간: ${currentTime}`)

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
      backupTime: currentTime,
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
