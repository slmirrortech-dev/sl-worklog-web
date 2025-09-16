import { NextRequest } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireAdmin, requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { ShiftType } from '@prisma/client'
import { LineResponseDto } from '@/types/line-with-process'
import { ApiError } from '@/lib/core/errors'
import { getShiftStatus } from '@/lib/utils/line-status'

/** 대기열에 작업자 추가 */
export async function addWaitingWorker(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

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

  return ApiResponseFactory.success(
    { added: addData, updated: updatedLine },
    '선택한 프로세스에 직원을 추가했습니다.',
  )
}

export const POST = withErrorHandler(addWaitingWorker)

/** 대기열에 작업자 삭제 */
export async function deleteWaitingWorker(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)
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

  return ApiResponseFactory.success(
    {
      deleted: deleteData,
      updated: updatedLine,
    },
    '선택한 프로세스의 대기중인 직원을 삭제했습니다.',
  )
}

export const DELETE = withErrorHandler(deleteWaitingWorker)

/** 대기열에 작업자 자리 교체 */
export async function swapWaitingWorker(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const {
    sourceProcessId,
    sourceShiftType,
    targetProcessId,
    targetShiftType,
  }: {
    sourceProcessId: string
    sourceShiftType: ShiftType
    targetProcessId: string
    targetShiftType: ShiftType
  } = await request.json()

  await prisma.$transaction(async (tx) => {
    // 기준 정보 가져오기
    const source = await tx.processShift.findUniqueOrThrow({
      where: {
        processId_type: {
          processId: sourceProcessId,
          type: sourceShiftType,
        },
      },
      select: {
        id: true,
        waitingWorkerId: true,
      },
    })

    // 타켓 정보 가져오기
    const target = await tx.processShift.findUniqueOrThrow({
      where: {
        processId_type: {
          processId: targetProcessId,
          type: targetShiftType,
        },
      },
      select: {
        id: true,
        waitingWorkerId: true,
      },
    })

    // 대기자 정보 스왑
    await tx.processShift.update({
      where: { id: source.id },
      data: { waitingWorkerId: target.waitingWorkerId },
    })

    await tx.processShift.update({
      where: { id: target.id },
      data: { waitingWorkerId: source.waitingWorkerId },
    })
  })

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

  return ApiResponseFactory.success(updatedLine, '대기열의 작업자 위치를 변경했습니다.')
}

export const PUT = withErrorHandler(swapWaitingWorker)
