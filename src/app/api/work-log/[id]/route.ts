import { NextRequest } from 'next/server'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import prisma from '@/lib/core/prisma'
import { updateWorkLogRequestModel, WorkLogResponseModel } from '@/types/work-log'
import { differenceInMinutes } from 'date-fns'
import { ApiError } from '@/lib/core/errors'

/** 특정 작업 기록 조회 */
async function getUniqueWorkLog(req: NextRequest, { params }: { params: { id: string } }) {
  await requireManagerOrAdmin(req)

  // 경로 파라미터에서 ID 추출
  const idParam = params.id

  const workLogs = (await prisma.workLog.findUnique({
    where: {
      id: idParam!,
    },
    select: {
      id: true,
      userId: true,
      userUserId: true,
      userName: true,
      startedAt: true,
      endedAt: true,
      durationMinutes: true,
      isDefective: true,
      processName: true,
      lineName: true,
      lineClassNo: true,
      shiftType: true,
      workStatus: true,
      memo: true,
      histories: true,
    },
  })) as WorkLogResponseModel

  return ApiResponseFactory.success<{
    workLogs: WorkLogResponseModel
  }>({ workLogs: workLogs }, '작업 기록을 조회했습니다.')
}

export const GET = withErrorHandler(getUniqueWorkLog)

/** 특정 작업 기록 수정 */
async function updateUniqueWorkLog(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireManagerOrAdmin(req)
  const idParam = params.id
  const body = (await req.json()) as Partial<updateWorkLogRequestModel>

  // 값을 문자열로 기록하기 위한 헬퍼 (히스토리용)
  const toStr = (v: any): string | null => {
    if (v === null || v === undefined) return null
    if (v instanceof Date) return v.toISOString()
    if (typeof v === 'boolean') return v ? 'true' : 'false'
    return String(v)
  }

  const result = await prisma.$transaction(async (tx) => {
    // 현재 작업 기록 조회
    const existingWorkLog = await tx.workLog.findUnique({ where: { id: idParam } })
    if (!existingWorkLog) {
      throw new ApiError('작업 기록을 찾을 수 없습니다.', 404, 'NOT_FOUND')
    }

    // 업데이트할 데이터 준비 (원본 코드 유지)
    const updateData: any = {}
    if (body.shiftType !== undefined) updateData.shiftType = body.shiftType
    if (body.workStatus !== undefined) updateData.workStatus = body.workStatus
    if (body.isDefective !== undefined) updateData.isDefective = body.isDefective
    if (body.startedAt !== undefined) updateData.startedAt = new Date(body.startedAt)
    if (body.endedAt !== undefined)
      updateData.endedAt = body.endedAt ? new Date(body.endedAt) : null
    if (body.lineName !== undefined) updateData.lineName = body.lineName
    if (body.lineClassNo !== undefined) updateData.lineClassNo = body.lineClassNo
    if (body.processName !== undefined) updateData.processName = body.processName
    if (body.memo !== undefined) updateData.memo = body.memo

    // 시간 계산(원본 로직 그대로)
    if (body.startedAt !== undefined || body.endedAt !== undefined) {
      const startedAt = body.startedAt ? new Date(body.startedAt) : existingWorkLog.startedAt
      const endedAt = body.endedAt ? new Date(body.endedAt) : existingWorkLog.endedAt
      if (startedAt && endedAt) {
        updateData.durationMinutes = differenceInMinutes(endedAt, startedAt)
      } else if (startedAt && !endedAt) {
        updateData.durationMinutes = null
      }
    }

    // 업데이트
    const updated = await tx.workLog.update({
      where: { id: idParam },
      data: updateData,
      select: {
        id: true,
        userId: true,
        userUserId: true,
        userName: true,
        startedAt: true,
        endedAt: true,
        durationMinutes: true,
        isDefective: true,
        processName: true,
        lineName: true,
        lineClassNo: true,
        shiftType: true,
        workStatus: true,
        memo: true,
        histories: true, // 필요시
      },
    })

    // 변경된 필드만 히스토리 적재 (원본/변경 후 비교)
    const FIELDS: Array<keyof typeof updated> = [
      'shiftType',
      'workStatus',
      'isDefective',
      'startedAt',
      'endedAt',
      'durationMinutes',
      'lineName',
      'lineClassNo',
      'processName',
      'memo',
    ]

    const diffs = FIELDS.flatMap((field) => {
      const beforeVal = (existingWorkLog as any)[field]
      const afterVal = (updated as any)[field]
      const changed =
        beforeVal instanceof Date && afterVal instanceof Date
          ? beforeVal.getTime() !== afterVal.getTime()
          : beforeVal !== afterVal
      if (!changed) return []
      return [
        {
          workLogId: updated.id,
          field: String(field),
          oldValue: toStr(beforeVal),
          newValue: toStr(afterVal),
          changedBy: session.id,
          changedByName: session.name ?? '',
          changedByUserId: session.userId ?? '',
          changedAt: new Date(),
        },
      ]
    })

    if (diffs.length) {
      await tx.workLogHistory.createMany({ data: diffs })
    }

    return updated
  })

  return ApiResponseFactory.success<{ workLogs: WorkLogResponseModel }>(
    { workLogs: result as WorkLogResponseModel },
    '작업 기록을 수정했습니다.',
  )
}

export const PUT = withErrorHandler(updateUniqueWorkLog)

/** 특정 작업 기록 삭제 */
async function deleteUniqueWorkLog(req: NextRequest, { params }: { params: { id: string } }) {
  await requireManagerOrAdmin(req)

  const idParam = params.id

  // 현재 작업 기록 조회
  const existingWorkLog = await prisma.workLog.findUnique({
    where: {
      id: idParam!,
    },
  })

  if (!existingWorkLog) {
    return ApiResponseFactory.error('작업 기록을 찾을 수 없습니다.')
  }

  // 작업 기록 삭제
  const workLogs = await prisma.workLog.delete({
    where: {
      id: idParam!,
    },
  })

  return ApiResponseFactory.success(workLogs, '작업 기록을 삭제했습니다.')
}

export const DELETE = withErrorHandler(deleteUniqueWorkLog)
