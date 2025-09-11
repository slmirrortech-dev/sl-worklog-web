import { NextRequest } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

/** 라인과 프로세스 통합 조회 */
export async function getLineWithProcess(req: NextRequest) {
  const data = await prisma.line.findMany({
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

  console.log('data', data)

  return ApiResponseFactory.success(data, '라인과 프로세스 통합 데이터를 조회했습니다.')
}

export const GET = withErrorHandler(getLineWithProcess)
