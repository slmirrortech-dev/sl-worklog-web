import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

export const runtime = 'nodejs'

/**
 * 공장라인 모든 정보 가져오기
 **/
async function getAllFactoryLine(request: NextRequest) {
  // 권한 확인
  await requireManagerOrAdmin(request)

  const factoryLine = await prisma.factoryLine.findMany({
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
  })

  return ApiResponseFactory.success(factoryLine, '라인 전체 정보를 가져왔습니다.')
}

export const GET = withErrorHandler(getAllFactoryLine)
