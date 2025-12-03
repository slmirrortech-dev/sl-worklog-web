import { NextRequest } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { FactoryConfigResponse } from '@/types/workplace'

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
    // 프로세스 갯수 변경
    const processCount = await tx.factoryConfig.update({
      where: {
        id: 'global_config',
      },
      data: {
        processCount: body.processCount,
      },
    })

    // 하위 공정라인에 프로세스 추가/삭제

    return processCount
  })

  return ApiResponseFactory.success(result, '공정 설정 정보를 수정했습니다.')
}

export const PUT = withErrorHandler(updateFactoryConfig)
