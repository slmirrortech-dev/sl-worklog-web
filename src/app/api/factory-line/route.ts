import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { FactoryLineRequest } from '@/types/workplace'
import { ShiftType, WorkStatus, Prisma } from '@prisma/client'

export const runtime = 'nodejs'

/**
 * 라인 생성 시 하위 데이터(shifts, slots) 자동 생성 헬퍼
 */
async function createLineWithShiftsAndSlots(
  tx: Prisma.TransactionClient,
  lineData: { name: string; displayOrder: number; workClassId: string },
  processCount: number,
) {
  return tx.factoryLine.create({
    data: {
      name: lineData.name,
      displayOrder: lineData.displayOrder,
      workClassId: lineData.workClassId,
      shifts: {
        create: [
          {
            type: ShiftType.DAY,
            status: WorkStatus.NORMAL,
            slots: {
              create: Array.from({ length: processCount }, (_, i) => ({
                name: `P${i + 1}`,
                slotIndex: i,
                workerStatus: WorkStatus.NORMAL,
              })),
            },
          },
          {
            type: ShiftType.NIGHT,
            status: WorkStatus.NORMAL,
            slots: {
              create: Array.from({ length: processCount }, (_, i) => ({
                name: `P${i + 1}`,
                slotIndex: i,
                workerStatus: WorkStatus.NORMAL,
              })),
            },
          },
        ],
      },
    },
  })
}

/**
 * 공장라인 정보 가져오기
 **/
async function getFactoryLine(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const factoryLine = await prisma.factoryLine.findMany({
    include: {
      shifts: false,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  })

  return ApiResponseFactory.success(factoryLine, '라인 정보를 가져왔습니다.')
}

export const GET = withErrorHandler(getFactoryLine)

/**
 * 공장라인 정보 수정하기
 **/
async function updateFactoryLine(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const body: FactoryLineRequest[] = await request.json()

  // 디버깅: 받은 데이터 로그
  console.log('=== 라인 업데이트 요청 ===')
  console.log('받은 라인 수:', body.length)
  console.log('받은 데이터:', JSON.stringify(body, null, 2))

  // DB에 있는 라인 데이터 가져오기
  await prisma.$transaction(async (tx) => {
    const config = await tx.factoryConfig.findFirst()
    const processCount = config?.processCount ?? 7 // 기본값 7

    const dbLines = await tx.factoryLine.findMany()
    console.log('DB에 있는 라인 수:', dbLines.length)
    console.log('DB 라인:', JSON.stringify(dbLines.map(l => ({ id: l.id, name: l.name, workClassId: l.workClassId })), null, 2))

    const processedDbIds = new Set()

    for (const item of body) {
      // id로 비교
      let match = dbLines.find((db) => db.id === item.id)

      // id로 일치하는 게 없으면 같은 반 내에서 이름으로 비교
      if (!match) {
        match = dbLines.find((db) => db.name === item.name && db.workClassId === item.workClassId)
      }

      console.log(`처리 중: ${item.name} (id: ${item.id}, workClassId: ${item.workClassId})`)
      console.log(`  매칭 결과:`, match ? `${match.name} (id: ${match.id})` : '없음 - 새로 생성')

      if (match) {
        // 기존 라인은 기본 정보만 업데이트 (shifts/slots는 유지)
        await tx.factoryLine.update({
          where: { id: match.id },
          data: {
            name: item.name,
            workClassId: item.workClassId,
            displayOrder: item.displayOrder,
          },
        })
        processedDbIds.add(match.id)
      } else {
        // 새 라인 생성 시 shifts와 slots 자동 생성
        await createLineWithShiftsAndSlots(
          tx,
          {
            name: item.name,
            displayOrder: item.displayOrder,
            workClassId: item.workClassId,
          },
          processCount,
        )
      }
    }

    // 필요 없는 거 삭제
    const linesToDelete = dbLines.filter((db) => !processedDbIds.has(db.id))
    console.log('삭제할 라인:', linesToDelete.map(l => ({ id: l.id, name: l.name, workClassId: l.workClassId })))

    await tx.factoryLine.deleteMany({
      where: {
        id: {
          in: linesToDelete.map((db) => db.id),
        },
      },
    })
    console.log('=== 라인 업데이트 완료 ===\n')
  })

  return ApiResponseFactory.success({}, '라인 정보가 수정되었습니다.')
}

export const PUT = withErrorHandler(updateFactoryLine)
