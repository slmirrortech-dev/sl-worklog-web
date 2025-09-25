import { NextRequest } from 'next/server'
import prisma from '@/lib/core/prisma'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { LineResponseDto } from '@/types/line-with-process'
import { getShiftStatus } from '@/lib/utils/line-status'
import { requireManagerOrAdmin, requireUser } from '@/lib/utils/auth-guards'

/** 라인과 프로세스 통합 조회 */
export async function getLineWithProcess(req: NextRequest) {
  // 로그인 여부 확인
  await requireUser(req)

  const lines = await prisma.line.findMany({
    include: {
      processes: {
        orderBy: { order: 'asc' },
        include: {
          shifts: {
            include: {
              waitingWorker: {
                select: { id: true, userId: true, name: true, licensePhotoUrl: true },
              },
            },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
  })

  const result: LineResponseDto[] = lines.map((line) => ({
    ...line,
    dayStatus: getShiftStatus(line.processes, 'DAY'),
    nightStatus: getShiftStatus(line.processes, 'NIGHT'),
  }))

  return ApiResponseFactory.success(result, '라인과 프로세스 통합 데이터를 조회했습니다.')
}

export const GET = withErrorHandler(getLineWithProcess)

//** 라인과 프로세스 통합 업데이트 */
export async function updateLineWithProcess(req: NextRequest) {
  await requireManagerOrAdmin(req)

  const body = await req.json()
  const { lineWithProcess } = body

  // 임시 ID 판별
  function isTempId(id: string) {
    return id.startsWith('temp-')
  }

  const result = (await prisma.$transaction(async (tx) => {
    // 기존 라인 조회
    const existingLines = await tx.line.findMany({ include: { processes: true } })

    // 삭제된 라인 처리
    const toDeleteLineIds = existingLines
      .filter((l) => !lineWithProcess.some((n: any) => n.id === l.id))
      .map((l) => l.id)

    if (toDeleteLineIds.length > 0) {
      // 삭제할 라인의 프로세스 조회
      const processesToDelete = await tx.process.findMany({
        where: { lineId: { in: toDeleteLineIds } },
        select: { id: true },
      })
      const procIds = processesToDelete.map((p) => p.id)

      if (procIds.length > 0) {
        // 교대조 삭제
        await tx.processShift.deleteMany({ where: { processId: { in: procIds } } })
        // 프로세스 삭제
        await tx.process.deleteMany({ where: { id: { in: procIds } } })
      }

      // 라인 삭제
      await tx.line.deleteMany({ where: { id: { in: toDeleteLineIds } } })
    }

    // 라인 저장/업데이트
    for (const line of lineWithProcess) {
      const savedLine = !isTempId(line.id)
        ? await tx.line.update({
            where: { id: line.id },
            data: { name: line.name, order: line.order, classNo: line.classNo },
          })
        : await tx.line.create({
            data: { name: line.name, order: line.order, classNo: line.classNo },
          })

      // 기존 프로세스 조회
      const existingProcesses = await tx.process.findMany({
        where: { lineId: savedLine.id },
      })

      // 삭제된 프로세스 처리
      const toDeleteProcIds = existingProcesses
        .filter((p) => !line.processes.some((n: any) => n.id === p.id))
        .map((p) => p.id)

      if (toDeleteProcIds.length > 0) {
        await tx.processShift.deleteMany({ where: { processId: { in: toDeleteProcIds } } })
        await tx.process.deleteMany({ where: { id: { in: toDeleteProcIds } } })
      }

      // 프로세스 저장/업데이트
      for (const proc of line.processes) {
        let savedProcess
        if (!isTempId(proc.id)) {
          // 기존 프로세스 업데이트
          savedProcess = await tx.process.update({
            where: { id: proc.id },
            data: { name: proc.name, order: proc.order, lineId: savedLine.id },
          })

          // 기존 프로세스의 shift 업데이트
          for (const shift of proc.shifts) {
            if (!isTempId(shift.id)) {
              await tx.processShift.update({
                where: { id: shift.id },
                data: {
                  type: shift.type,
                  status: shift.status,
                  waitingWorkerId: shift.waitingWorkerId,
                },
              })
            } else {
              // 새로운 shift 생성 (기존 프로세스에 새 shift 추가되는 경우)
              await tx.processShift.create({
                data: {
                  processId: savedProcess.id,
                  type: shift.type,
                  status: shift.status,
                  waitingWorkerId: shift.waitingWorkerId,
                },
              })
            }
          }
        } else {
          // 새 프로세스 생성
          savedProcess = await tx.process.create({
            data: { name: proc.name, order: proc.order, lineId: savedLine.id },
          })

          // 새 프로세스에 대한 shift 생성
          for (const shift of proc.shifts) {
            await tx.processShift.create({
              data: {
                processId: savedProcess.id,
                type: shift.type,
                status: shift.status,
                waitingWorkerId: shift.waitingWorkerId,
              },
            })
          }
        }
      }
    }

    // 최종 데이터 조회
    return await tx.line.findMany({
      include: {
        processes: {
          orderBy: { order: 'asc' },
          include: {
            shifts: {
              include: {
                waitingWorker: {
                  select: { id: true, userId: true, name: true, licensePhotoUrl: true },
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
