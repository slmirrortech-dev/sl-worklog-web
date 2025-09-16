import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { ShiftType, WorkStatus } from '@prisma/client'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { getShiftStatus } from '@/lib/utils/line-status'
import { LineResponseDto } from '@/types/line-with-process'

export async function updateLineStatus(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const {
    lineId,
    shiftType,
    workStatus,
  }: {
    lineId: string
    shiftType: ShiftType
    workStatus: WorkStatus
  } = await request.json()

  await prisma.$transaction(async (tx) => {
    // 라인에 속한 프로세스 ID 가져오기
    const processes = await tx.process.findMany({
      where: { lineId },
      select: { id: true },
    })
    const processIds = processes.map((p) => p.id)

    if (processIds.length === 0) return

    // 해당 프로세스들의 shift 업데이트
    await tx.processShift.updateMany({
      where: {
        processId: { in: processIds },
        type: shiftType,
      },
      data: { status: workStatus },
    })
  })

  // 업데이트 후 라인 전체 데이터 다시 조회
  const lines = await prisma.line.findMany({
    include: {
      processes: {
        include: {
          shifts: {
            include: {
              waitingWorker: {
                select: { id: true, userId: true, name: true },
              },
            },
          },
        },
      },
    },
  })

  // 확장 데이터 추가
  const updatedLine = lines.map((line) => ({
    ...line,
    dayStatus: getShiftStatus(line.processes, 'DAY'),
    nightStatus: getShiftStatus(line.processes, 'NIGHT'),
  })) as LineResponseDto[]

  return ApiResponseFactory.success(updatedLine, '선택한 라인의 상태를 변경했습니다.')
}

export const PUT = withErrorHandler(updateLineStatus)
