import { NextRequest } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { LineResponseDto } from '@/types/line-with-process'
import { getShiftStatus } from '@/lib/utils/line-status'

/** 모니터용 라인과 프로세스 통합 조회 (인증 불필요) */
export async function getLineWithProcessForMonitor(req: NextRequest) {
  const lines = await prisma.line.findMany({
    include: {
      processes: {
        orderBy: { order: 'asc' },
        include: {
          shifts: {
            include: {
              waitingWorker: {
                select: { id: true, userId: true, name: true, licensePhotoUrl: true },
              },
            },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
  })

  const result: LineResponseDto[] = lines.map((line) => ({
    ...line,
    dayStatus: getShiftStatus(line.processes, 'DAY'),
    nightStatus: getShiftStatus(line.processes, 'NIGHT'),
  }))

  return ApiResponseFactory.success(result, '모니터용 라인과 프로세스 데이터를 조회했습니다.')
}

export const GET = withErrorHandler(getLineWithProcessForMonitor)