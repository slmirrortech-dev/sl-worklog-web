import { NextRequest } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireAdmin } from '@/lib/utils/auth-guards'
import { ShiftType } from '@prisma/client'
import { LineResponseDto } from '@/types/line-with-process'
import { ApiError } from '@/lib/core/errors'

/** 대기열에 작업자 추가 */
export async function addWaitingWorker(request: NextRequest) {
  // 관리자 권한 확인
  await requireAdmin(request)

  const body: {
    processId: string
    shiftType: ShiftType
    usersUuid: string
  } = await request.json()

  // 선택한 사용자 검색
  const addUser = await prisma.user.findUnique({
    where: {
      id: body.usersUuid,
    },
  })

  // 사용자 존재 확인
  if (!addUser) {
    throw new ApiError('사용자를 찾을 수 없습니다.')
  }

  const addData = await prisma.processShift.update({
    where: {
      processId_type: {
        processId: body.processId,
        type: body.shiftType as ShiftType,
      },
    },
    data: {
      waitingWorker: {
        connect: addUser,
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
    { added: addData, updated: updatedLine },
    '선택한 프로세스에 직원을 추가했습니다.',
  )
}

export const POST = withErrorHandler(addWaitingWorker)

/** 대기열에 작업자 삭제 */
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
