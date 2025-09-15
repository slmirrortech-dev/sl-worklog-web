import { NextRequest } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { LineResponseDto } from '@/types/line-with-process'
import { getShiftStatus } from '@/lib/utils/line-status'

/** 라인과 프로세스 통합 조회 */
export async function getLineWithProcess(req: NextRequest) {
  let result: LineResponseDto[] = []
  const lines = await prisma.line.findMany({
    include: {
      processes: {
        orderBy: { order: 'asc' },
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
    orderBy: { order: 'asc' },
  })

  // 확장
  result = lines.map((line) => ({
    ...line,
    dayStatus: getShiftStatus(line.processes, 'DAY'),
    nightStatus: getShiftStatus(line.processes, 'NIGHT'),
  }))

  return ApiResponseFactory.success(result, '라인과 프로세스 통합 데이터를 조회했습니다.')
}

export const GET = withErrorHandler(getLineWithProcess)

/** 라인과 프로세스 통합 업데이트 */
export async function updateLineWithProcess(req: NextRequest) {
  const body = await req.json()
  const { lineWithProcess } = body

  const result = (await prisma.$transaction(async (tx) => {
    // 기존 라인 전체 조회
    const existingLines = await tx.line.findMany({
      include: { processes: true },
    })

    // 삭제된 라인 제거
    const toDeleteLineIds = existingLines
      .filter((l) => !lineWithProcess.some((n: any) => n.id === l.id))
      .map((l) => l.id)

    if (toDeleteLineIds.length > 0) {
      await tx.line.deleteMany({ where: { id: { in: toDeleteLineIds } } })
    }

    // 라인 + 프로세스 저장
    for (const line of lineWithProcess) {
      const existingLine = line.id ? await tx.line.findUnique({ where: { id: line.id } }) : null

      const savedLine = existingLine
        ? await tx.line.update({
            where: { id: line.id },
            data: {
              name: line.name,
              order: line.order,
              classNo: line.classNo,
            },
          })
        : await tx.line.create({
            data: {
              name: line.name,
              order: line.order,
              classNo: line.classNo,
            },
          })

      // 기존 프로세스 조회
      const existingProcesses = await tx.process.findMany({
        where: { lineId: savedLine.id },
      })

      const toDeleteProcIds = existingProcesses
        .filter((p) => !line.processes.some((n: any) => n.id === p.id))
        .map((p) => p.id)

      if (toDeleteProcIds.length > 0) {
        await tx.process.deleteMany({ where: { id: { in: toDeleteProcIds } } })
      }

      for (const proc of line.processes) {
        const existingProc = proc.id
          ? await tx.process.findUnique({ where: { id: proc.id } })
          : null

        if (existingProc) {
          await tx.process.update({
            where: { id: proc.id },
            data: { name: proc.name, order: proc.order },
          })
        } else {
          await tx.process.create({
            data: { name: proc.name, order: proc.order, lineId: savedLine.id },
          })
        }
      }
    }

    // 최종 저장된 데이터 다시 조회
    return await tx.line.findMany({
      include: {
        processes: {
          orderBy: { order: 'asc' },
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
      orderBy: { order: 'asc' },
    })
  })) as LineResponseDto[]

  return ApiResponseFactory.success(result, '라인과 프로세스 업데이트 완료')
}

export const POST = withErrorHandler(updateLineWithProcess)
