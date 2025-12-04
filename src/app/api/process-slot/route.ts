import { NextRequest } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { ShiftType } from '@prisma/client'
import { ApiError } from '@/lib/core/errors'

export const runtime = 'nodejs'

/**
 * ProcessSlot에 작업자 추가
 */
async function addWorkerToSlot(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const body: {
    lineId: string
    shiftType: ShiftType
    slotIndex: number
    workerId: string
    force?: boolean
  } = await request.json()

  const { lineId, shiftType, slotIndex, workerId, force = false } = body

  // 작업자 존재 확인
  const worker = await prisma.user.findUnique({
    where: { id: workerId },
  })

  if (!worker) {
    throw new ApiError('작업자를 찾을 수 없습니다.', 404)
  }

  // 작업자가 이미 다른 곳에 배치되어 있는지 확인
  // 모든 배치를 찾은 후 현재 위치가 아닌 곳을 필터링
  const allAssignments = await prisma.processSlot.findMany({
    where: {
      workerId,
    },
    include: {
      shift: {
        include: {
          line: true,
        },
      },
    },
  })

  // 현재 시도하는 위치가 아닌 다른 배치가 있는지 확인
  const existingAssignment = allAssignments.find(
    (assignment) =>
      !(
        assignment.shift.lineId === lineId &&
        assignment.shift.type === shiftType &&
        assignment.slotIndex === slotIndex
      ),
  )

  if (existingAssignment && !force) {
    // 이미 배치되어 있으면 기존 위치 정보와 함께 에러 반환
    const shiftTypeKor = existingAssignment.shift.type === 'DAY' ? '주간' : '야간'
    throw new ApiError(
      `${worker.name}(${worker.userId})님은 이미 ${existingAssignment.shift.line.name} ${shiftTypeKor} P${existingAssignment.slotIndex + 1}에 배치되어 있습니다.`,
      409,
    )
  }

  // force=true인 경우 기존 배치에서 제거
  if (existingAssignment && force) {
    await prisma.processSlot.update({
      where: { id: existingAssignment.id },
      data: { workerId: null },
    })
  }

  // LineShift 찾기
  const lineShift = await prisma.lineShift.findUnique({
    where: {
      lineId_type: {
        lineId,
        type: shiftType,
      },
    },
  })

  if (!lineShift) {
    throw new ApiError('해당 근무조를 찾을 수 없습니다.', 404)
  }

  // ProcessSlot 찾기 또는 생성
  const existingSlot = await prisma.processSlot.findUnique({
    where: {
      shiftId_slotIndex: {
        shiftId: lineShift.id,
        slotIndex,
      },
    },
  })

  let updatedSlot

  if (existingSlot) {
    // 이미 다른 작업자가 있는지 확인
    if (existingSlot.workerId && existingSlot.workerId !== workerId) {
      throw new ApiError('해당 슬롯에 이미 다른 작업자가 배치되어 있습니다.', 400)
    }

    // 기존 슬롯 업데이트
    updatedSlot = await prisma.processSlot.update({
      where: { id: existingSlot.id },
      data: {
        workerId,
        workerStatus: 'NORMAL',
      },
      include: {
        worker: {
          select: {
            id: true,
            userId: true,
            name: true,
            licensePhotoUrl: true,
          },
        },
      },
    })
  } else {
    // 새 슬롯 생성
    updatedSlot = await prisma.processSlot.create({
      data: {
        name: `P${slotIndex}`,
        slotIndex,
        shiftId: lineShift.id,
        workerId,
        workerStatus: 'NORMAL',
      },
      include: {
        worker: {
          select: {
            id: true,
            userId: true,
            name: true,
            licensePhotoUrl: true,
          },
        },
      },
    })
  }

  // 전체 라인 정보 다시 가져오기
  const allLines = await prisma.factoryLine.findMany({
    include: {
      workClass: true,
      shifts: {
        include: {
          slots: {
            include: {
              worker: {
                select: {
                  id: true,
                  userId: true,
                  name: true,
                  licensePhotoUrl: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { displayOrder: 'asc' },
  })

  return ApiResponseFactory.success(
    {
      slot: updatedSlot,
      allLines,
    },
    '작업자가 성공적으로 배치되었습니다.',
  )
}

export const POST = withErrorHandler(addWorkerToSlot)

/**
 * ProcessSlot에서 작업자 제거
 */
async function removeWorkerFromSlot(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const { searchParams } = new URL(request.url)
  const lineId = searchParams.get('lineId')
  const shiftType = searchParams.get('shiftType') as ShiftType
  const slotIndexStr = searchParams.get('slotIndex')

  if (!lineId || !shiftType || !slotIndexStr) {
    throw new ApiError('필수 파라미터가 누락되었습니다.', 400)
  }

  const slotIndex = parseInt(slotIndexStr, 10)

  // LineShift 찾기
  const lineShift = await prisma.lineShift.findUnique({
    where: {
      lineId_type: {
        lineId,
        type: shiftType,
      },
    },
  })

  if (!lineShift) {
    throw new ApiError('해당 근무조를 찾을 수 없습니다.', 404)
  }

  // ProcessSlot 찾기
  const slot = await prisma.processSlot.findUnique({
    where: {
      shiftId_slotIndex: {
        shiftId: lineShift.id,
        slotIndex,
      },
    },
  })

  if (!slot) {
    throw new ApiError('해당 슬롯을 찾을 수 없습니다.', 404)
  }

  if (!slot.workerId) {
    throw new ApiError('해당 슬롯에 작업자가 배치되어 있지 않습니다.', 400)
  }

  // workerId를 null로 설정
  const updatedSlot = await prisma.processSlot.update({
    where: { id: slot.id },
    data: {
      workerId: null,
    },
  })

  // 전체 라인 정보 다시 가져오기
  const allLines = await prisma.factoryLine.findMany({
    include: {
      workClass: true,
      shifts: {
        include: {
          slots: {
            include: {
              worker: {
                select: {
                  id: true,
                  userId: true,
                  name: true,
                  licensePhotoUrl: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { displayOrder: 'asc' },
  })

  return ApiResponseFactory.success(
    {
      slot: updatedSlot,
      allLines,
    },
    '작업자가 성공적으로 제거되었습니다.',
  )
}

export const DELETE = withErrorHandler(removeWorkerFromSlot)

/**
 * ProcessSlot의 작업자 상태(workerStatus) 업데이트
 */
async function updateWorkerStatus(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const body: {
    lineId: string
    shiftType: ShiftType
    slotIndex: number
    workerStatus: 'NORMAL' | 'OVERTIME'
  } = await request.json()

  const { lineId, shiftType, slotIndex, workerStatus } = body

  // LineShift 찾기
  const lineShift = await prisma.lineShift.findUnique({
    where: {
      lineId_type: {
        lineId,
        type: shiftType,
      },
    },
  })

  if (!lineShift) {
    throw new ApiError('해당 근무조를 찾을 수 없습니다.', 404)
  }

  // ProcessSlot 찾기
  const slot = await prisma.processSlot.findUnique({
    where: {
      shiftId_slotIndex: {
        shiftId: lineShift.id,
        slotIndex,
      },
    },
  })

  if (!slot) {
    throw new ApiError('해당 슬롯을 찾을 수 없습니다.', 404)
  }

  if (!slot.workerId) {
    throw new ApiError('해당 슬롯에 작업자가 배치되어 있지 않습니다.', 400)
  }

  // workerStatus 업데이트
  const updatedSlot = await prisma.processSlot.update({
    where: { id: slot.id },
    data: {
      workerStatus,
    },
    include: {
      worker: {
        select: {
          id: true,
          userId: true,
          name: true,
          licensePhotoUrl: true,
        },
      },
    },
  })

  // 전체 라인 정보 다시 가져오기
  const allLines = await prisma.factoryLine.findMany({
    include: {
      workClass: true,
      shifts: {
        include: {
          slots: {
            include: {
              worker: {
                select: {
                  id: true,
                  userId: true,
                  name: true,
                  licensePhotoUrl: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { displayOrder: 'asc' },
  })

  return ApiResponseFactory.success(
    {
      slot: updatedSlot,
      allLines,
    },
    '작업자 상태가 성공적으로 변경되었습니다.',
  )
}

export const PATCH = withErrorHandler(updateWorkerStatus)
