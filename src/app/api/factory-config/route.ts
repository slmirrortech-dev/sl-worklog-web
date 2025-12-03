import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { FactoryConfigResponse } from '@/types/workplace'
import { WorkStatus } from '@prisma/client'

export const runtime = 'nodejs'

/**
 * 공장 설정 가져오기
 **/
async function getFactoryConfig(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const factoryConfig = (await prisma.factoryConfig.findFirst()) as FactoryConfigResponse

  return ApiResponseFactory.success(factoryConfig, '공정 설정 정보를 가져왔습니다.')
}

export const GET = withErrorHandler(getFactoryConfig)

/**
 * 공장 설정 업데이트
 **/
async function updateFactoryConfig(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const body = await request.json()

  const result = await prisma.$transaction(async (tx) => {
    // 기존 processCount 조회
    const currentConfig = await tx.factoryConfig.findFirst()
    const oldProcessCount = currentConfig?.processCount ?? 7
    const newProcessCount = body.processCount

    // processCount 업데이트
    const updatedConfig = await tx.factoryConfig.update({
      where: {
        id: 'global_config',
      },
      data: {
        processCount: newProcessCount,
      },
    })

    // processCount 변경 시 모든 LineShift의 ProcessSlot 조정
    if (oldProcessCount !== newProcessCount) {
      // 모든 LineShift 조회
      const allShifts = await tx.lineShift.findMany({
        include: {
          slots: {
            orderBy: {
              slotIndex: 'asc',
            },
          },
        },
      })

      for (const shift of allShifts) {
        if (newProcessCount > oldProcessCount) {
          // 슬롯 추가: 부족한 만큼 생성
          const slotsToAdd = newProcessCount - oldProcessCount
          const startIndex = oldProcessCount

          const newSlots = Array.from({ length: slotsToAdd }, (_, i) => ({
            name: `P${startIndex + i + 1}`,
            slotIndex: startIndex + i,
            shiftId: shift.id,
            workerStatus: WorkStatus.NORMAL,
          }))

          await tx.processSlot.createMany({
            data: newSlots,
          })
        } else if (newProcessCount < oldProcessCount) {
          // 슬롯 삭제: 초과된 슬롯 제거 (뒤에서부터)
          const slotsToDelete = shift.slots.filter((slot) => slot.slotIndex >= newProcessCount)

          if (slotsToDelete.length > 0) {
            await tx.processSlot.deleteMany({
              where: {
                id: {
                  in: slotsToDelete.map((s) => s.id),
                },
              },
            })
          }
        }
      }
    }

    return updatedConfig
  })

  return ApiResponseFactory.success(result, '공정 설정 정보를 수정했습니다.')
}

export const PUT = withErrorHandler(updateFactoryConfig)
