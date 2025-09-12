import { NextRequest } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireAdmin } from '@/lib/utils/auth-guards'
import { ShiftType } from '@prisma/client'
import { LineResponseDto } from '@/types/line-with-process'

/** 대기열에서 작업자 삭제 */
export async function deleteWaitingWorker(request: NextRequest) {
  // 관리자 권한 확인
  await requireAdmin(request)
  // 쿼리 파라미터 확인
  const { searchParams } = new URL(request.url)
  // 역할 (다중 role 지원)
  const processId = searchParams.get('processId') || ''
  const shiftType = searchParams.get('shiftType') || 'DAY'

  const deleteData = await prisma.processShift.update({
    where: {
      processId_type: {
        processId: processId,
        type: shiftType as ShiftType,
      },
    },
    data: {
      waitingWorker: {
        disconnect: true,
      },
    },
  })

  const updatedLine = (await prisma.line.findMany({
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
  })) as LineResponseDto[]

  return ApiResponseFactory.success(
    { deleted: deleteData, updated: updatedLine },
    '선택한 프로세스의 대기중인 직원을 삭제했습니다.',
  )
}

export const DELETE = withErrorHandler(deleteWaitingWorker)
