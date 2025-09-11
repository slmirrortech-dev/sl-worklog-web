// import { prisma } from '@/lib/prisma'
// import { NextRequest } from 'next/server'
// import { requireAdmin } from '@/lib/bak_session'
// import { ApiResponse } from '@/lib/response'
// import { withErrorHandler } from '@/lib/api-handler'
// import { LineResponseDto, SaveLineDto } from '@/types/dto/lineProcess.dto'
//
// export const runtime = 'nodejs'
// export const dynamic = 'force-dynamic'
//
// /**
//  * @swagger
//  * /api/line-line-with-process:
//  *   get:
//  *     summary: 작업장 정보 조회 (라인, 공정 통합)
//  *     tags: [LineProcess]
//  *     parameters:
//  *      - in: query
//  *        name: isActive
//  *        schema:
//  *          type: boolean
//  *          default: true
//  *          required: false
//  *          description: 활성 상태 필터 (true=활성, false=비활성)
//  *     responses:
//  *       200:
//  *         description: 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: 작업장 정보 조회 성공
//  *       404:
//  *         description: 없음
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       403:
//  *         description: 권한 없음
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// async function getLineProcess(req: NextRequest) {
//   await requireAdmin(req)
//
//   const { searchParams } = new URL(req.url)
//   const isActiveParam = searchParams.get('isActive')
//   const isActive = isActiveParam === null ? undefined : isActiveParam === 'true'
//
//   const lineProcess = await prisma.line.findMany({
//     where: { isActive },
//     include: {
//       processes: {
//         where: { isActive },
//         orderBy: { order: 'asc' },
//       }, // 각 라인에 속한 프로세스까지 가져오기
//     },
//     orderBy: { order: 'asc' }, // 라인 순서 정렬
//   })
//
//   return ApiResponse.success<LineResponseDto[]>(lineProcess, '작업장 통합 조회 성공')
// }
// export const GET = withErrorHandler(getLineProcess)
//
// /**
//  * @swagger
//  * /api/line-line-with-process:
//  *   put:
//  *     summary: 작업장 정보 수정 (라인, 공정 통합)
//  *     tags: [LineProcess]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *             schema:
//  *                type: object
//  *                description: 라인+프로세스 전체 구조 (자세한 필드는 생략)
//  *     responses:
//  *       200:
//  *         description: 성공
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: 작업장 정보 수정 성공
//  *                 data:
//  *                   $ref: '#/components/schemas/SaveLineDto'
//  *       404:
//  *         description: 없음
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       403:
//  *         description: 권한 없음
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// async function updateLineProcess(req: NextRequest) {
//   await requireAdmin(req)
//   const body: SaveLineDto = await req.json()
//
//   const updated = await prisma.$transaction(async (tx) => {
//     const existingLines = await tx.line.findMany({ include: { processes: true } })
//     const existingLineIds = new Set(existingLines.map((l) => l.id))
//     const incomingLineIds = new Set(body.filter((l) => l.id).map((l) => l.id!))
//
//     // 기존 라인 중 요청에 없는 것 → soft delete
//     for (const line of existingLines) {
//       if (!incomingLineIds.has(line.id)) {
//         await tx.line.update({
//           where: { id: line.id },
//           data: { isActive: false, deactivatedAt: new Date() },
//         })
//       }
//     }
//
//     // 요청이 빈 배열이면 전체 비활성화
//     if (body.length === 0) {
//       await tx.line.updateMany({
//         data: { isActive: false, deactivatedAt: new Date() },
//       })
//       await tx.line-with-process.updateMany({
//         data: { isActive: false, deactivatedAt: new Date() },
//       })
//       return []
//     }
//
//     // 요청 라인 순회하며 create/update
//     for (const line of body) {
//       let lineId = line.id
//
//       if (lineId && existingLineIds.has(lineId)) {
//         // 수정 + 다시 활성화 가능
//         await tx.line.update({
//           where: { id: lineId },
//           data: {
//             name: line.name,
//             order: line.order,
//             isActive: line.isActive ?? true,
//             deactivatedAt: line.isActive === false ? new Date() : null,
//           },
//         })
//       } else {
//         const created = await tx.line.create({
//           data: {
//             name: line.name,
//             order: line.order,
//             processes: {
//               create: line.processes.map((p) => ({
//                 name: p.name,
//                 order: p.order,
//                 isActive: true,
//               })),
//             },
//           },
//         })
//         lineId = created.id
//       }
//
//       // 프로세스 처리
//       if (lineId) {
//         const existingProcesses = await tx.line-with-process.findMany({ where: { lineId } })
//         const existingProcessIds = new Set(existingProcesses.map((p) => p.id))
//         const incomingProcessIds = new Set(line.processes.filter((p) => p.id).map((p) => p.id!))
//
//         // 기존 프로세스 중 요청에 없는 것 → soft delete
//         for (const p of existingProcesses) {
//           if (!incomingProcessIds.has(p.id)) {
//             await tx.line-with-process.update({
//               where: { id: p.id },
//               data: { isActive: false, deactivatedAt: new Date() },
//             })
//           }
//         }
//
//         // 요청 프로세스 처리
//         for (const p of line.processes) {
//           if (p.id && existingProcessIds.has(p.id)) {
//             await tx.line-with-process.update({
//               where: { id: p.id },
//               data: {
//                 name: p.name,
//                 order: p.order,
//                 isActive: p.isActive ?? true,
//                 deactivatedAt: p.isActive === false ? new Date() : null,
//               },
//             })
//           } else {
//             await tx.line-with-process.create({
//               data: { lineId, name: p.name, order: p.order, isActive: true },
//             })
//           }
//         }
//       }
//     }
//
//     return tx.line.findMany({
//       include: { processes: true },
//       orderBy: { order: 'asc' },
//     })
//   })
//
//   return ApiResponse.success<LineResponseDto[]>(updated, '작업장 통합 수정 성공')
// }
//
// export const PUT = withErrorHandler(updateLineProcess)
