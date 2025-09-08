// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import { requireAdmin } from '@/lib/bak_session'
// import { ApiResponse } from '@/lib/response'
// import { withErrorHandler } from '@/lib/api-handler'
//
// export const runtime = 'nodejs'
// export const dynamic = 'force-dynamic'
//
// /**
//  * @swagger
//  * /api/work-log:
//  *   get:
//  *     summary: 작업 기록 조회
//  *     description: 작업 기록을 조건에 따라 조회한다
//  *     tags: [WorkLog]
//  *     parameters:
//  *       - in: query
//  *         name: searchStartAt
//  *         schema:
//  *           type: string
//  *           format: date-time
//  *         description: 검색 시작일 (ISO 8601 형식)
//  *       - in: query
//  *         name: searchEndAt
//  *         schema:
//  *           type: string
//  *           format: date-time
//  *         description: 검색 종료일 (ISO 8601 형식)
//  *       - in: query
//  *         name: searchShiftType
//  *         schema:
//  *           type: string
//  *           enum: [DAY_NORMAL, DAY_OVERTIME, NIGHT_NORMAL, NIGHT_OVERTIME, UNKNOWN]
//  *         description: 근무 형태 필터
//  *       - in: query
//  *         name: searchLineId
//  *         schema:
//  *           type: string
//  *         description: 라인 ID (또는 스냅샷 lineName)
//  *       - in: query
//  *         name: searchProcessId
//  *         schema:
//  *           type: string
//  *         description: 공정 ID (또는 스냅샷 processName)
//  *       - in: query
//  *         name: searchIsDefective
//  *         schema:
//  *           type: boolean
//  *         description: 불량 여부 (true/false)
//  *       - in: query
//  *         name: searchWorker
//  *         schema:
//  *           type: string
//  *         description: 직원 사번 또는 이름으로 검색
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: number
//  *           default: 1
//  *         description: 페이지 번호 (1 이상)
//  *       - in: query
//  *         name: pageSize
//  *         schema:
//  *           type: number
//  *           default: 10
//  *         description: 페이지 사이즈 (1 이상)
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
//  *       400:
//  *         description: 잘못된 요청
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: 서버 오류
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// async function getWorkLog(req: NextRequest) {
//   await requireAdmin(req)
//
//   const { searchParams } = new URL(req.url)
//
//   // 검색 조건 파라미터
//   const searchStartAt = searchParams.get('searchStartAt')
//   const searchEndAt = searchParams.get('searchEndAt')
//   const searchShiftType = searchParams.get('searchShiftType')
//   const searchLineId = searchParams.get('searchLineId')
//   const searchProcessId = searchParams.get('searchProcessId')
//   const searchIsDefective = searchParams.get('searchIsDefective')
//   const searchWorker = searchParams.get('searchWorker')
//
//   const pageParam = parseInt(searchParams.get('page') || '1', 10)
//   const pageSizeParam = parseInt(searchParams.get('pageSize') || '10', 10)
//
//   if (isNaN(pageParam) || pageParam < 1 || isNaN(pageSizeParam) || pageSizeParam < 1) {
//     return NextResponse.json(
//       { error: 'page와 pageSize는 1 이상의 유효한 숫자여야 합니다' },
//       { status: 400 },
//     )
//   }
//
//   const skip = (pageParam - 1) * pageSizeParam
//   const take = pageSizeParam
//
//   // where 조건 생성
//   const where: any = {}
//
//   // 날짜 검색
//   if (searchStartAt || searchEndAt) {
//     where.startedAt = {}
//     if (searchStartAt) where.startedAt.gte = new Date(searchStartAt)
//     if (searchEndAt) where.startedAt.lte = new Date(searchEndAt)
//   }
//
//   // 시프트타입
//   if (searchShiftType) {
//     where.shiftType = searchShiftType
//   }
//
//   // 불량 여부
//   if (searchIsDefective !== null) {
//     if (searchIsDefective === 'true') where.isDefective = true
//     if (searchIsDefective === 'false') where.isDefective = false
//   }
//
//   // 라인 (현재 라인 id, 과거 스냅샷 lineName 둘 다 검색)
//   if (searchLineId) {
//     where.OR = [
//       { process: { lineId: searchLineId } }, // 현재 라인 id 기준
//       { lineName: { contains: searchLineId, mode: 'insensitive' } }, // 과거 스냅샷 (문자열 검색)
//     ]
//   }
//
//   // 공정 (id 기준 + 스냅샷 이름 기준)
//   if (searchProcessId) {
//     where.OR = [
//       ...(where.OR || []),
//       { processId: searchProcessId },
//       { processName: { contains: searchProcessId, mode: 'insensitive' } },
//     ]
//   }
//
//   // 직원 (이름, 사번)
//   if (searchWorker) {
//     where.user = {
//       OR: [
//         { loginId: { contains: searchWorker, mode: 'insensitive' } },
//         { name: { contains: searchWorker, mode: 'insensitive' } },
//       ],
//     }
//   }
//
//   // 실제 조회
//   const [items, totalCount] = await Promise.all([
//     prisma.workLog.findMany({
//       where,
//       skip,
//       take,
//       orderBy: { startedAt: 'desc' },
//       include: {
//         user: { select: { id: true, loginId: true, name: true } },
//         process: { select: { id: true, name: true, lineId: true } },
//       },
//     }),
//     prisma.workLog.count({ where }),
//   ])
//
//   return ApiResponse.success(
//     {
//       totalCount,
//       page: pageParam,
//       pageSize: pageSizeParam,
//       items,
//     },
//     '작업 기록 조회 성공',
//   )
// }
//
// export const GET = withErrorHandler(getWorkLog)
