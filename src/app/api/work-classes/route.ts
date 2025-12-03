import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { WorkClassRequestModel } from '@/types/workplace'

export const runtime = 'nodejs'

/**
 * 반 가져오기
 **/
async function getWorkClasses(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const workClasses = await prisma.workClass.findMany({
    orderBy: { displayOrder: 'asc' },
  })

  return ApiResponseFactory.success(workClasses, '반 전체를 가져왔습니다.')
}

export const GET = withErrorHandler(getWorkClasses)

/**
 * 반 생성하기
 **/
async function updateWorkClass(req: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(req)

  const body: WorkClassRequestModel[] = await req.json()

  const updatedClasses = await prisma.$transaction(async (tx) => {
    // 모든 반 가져오기
    const dbItems = await tx.workClass.findMany()

    // 살아남은 아이가 담길 곳
    const processedDbIds = new Set()

    // 프론트에서 온 데이터 순회하면서 확인하기
    for (const item of body) {
      // 매칭되는 아이디 찾기
      let match = dbItems.find((db) => db.id === item.id)

      // 매칭되는 아이디가 없으면 이름으로 찾기
      if (!match) {
        match = dbItems.find((db) => db.name === item.name)
      }

      if (match) {
        await tx.workClass.update({
          where: { id: match.id }, // db에서 찾아낸 원본 id를 넣기
          data: {
            name: item.name,
            displayOrder: item.displayOrder,
          }, // 수정된 내용으로 넣기
        })

        processedDbIds.add(match.id) // 처리완료 된 항목은 추가
      } else {
        await tx.workClass.create({
          data: {
            name: item.name,
            displayOrder: item.displayOrder,
          },
        })
      }
    }

    // 필요 없는거 삭제
    const idsToDelete = dbItems.filter((db) => !processedDbIds.has(db.id)).map((db) => db.id)

    if (idsToDelete.length > 0) {
      await tx.workClass.deleteMany({
        where: { id: { in: idsToDelete } },
      })
    }

    // 결과 반환
    return await tx.workClass.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    })
  })

  return ApiResponseFactory.success(updatedClasses, '반 업데이트 완료')
}

export const PUT = withErrorHandler(updateWorkClass)
