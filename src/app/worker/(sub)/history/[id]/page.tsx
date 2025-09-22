import React from 'react'
import prisma from '@/lib/core/prisma'
import { WorkLogResponseModel } from '@/types/work-log'
import { format } from 'date-fns'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import ShiftTypeLabel from '@/components/admin/ShiftTypeLabel'
import { displayMinutes } from '@/lib/utils/time'

const DetailHistoryPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  const workLog = (await prisma.workLog.findUnique({
    where: { id: id },
    include: {
      processShift: {
        include: {
          process: {
            include: {
              line: true,
            },
          },
        },
      },
    },
  })) as WorkLogResponseModel

  console.log(workLog)

  return (
    <div className="min-h-[calc(100vh-60px)] flex justify-center bg-gray-50">
      <div className="w-full max-w-sm px-6 py-6 flex flex-col">
        {/* 작업 기록 정보 */}
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-4">작업 기록 상세</h1>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">시간대</span>
              <ShiftTypeLabel shiftType={workLog.processShift.type} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">상태</span>
              <ShiftStatusLabel status={workLog.processShift.status} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">라인</span>
              <span className="font-medium text-lg">{workLog.processShift.process.line.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">반</span>
              <span className="font-medium text-lg">
                {workLog.processShift.process.line.classNo}반
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">공정</span>
              <span className="font-medium text-lg">{workLog.processShift.process.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">시작일시</span>
              <span className="font-medium text-lg">
                {format(workLog.startedAt, 'yyyy-MM-dd HH:mm')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">종료일시</span>
              <span className="font-medium text-lg">
                {format(workLog.endedAt!, 'yyyy-MM-dd HH:mm')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-lg">총 작업시간</span>
              <span className="font-medium text-lg">
                {displayMinutes(workLog?.durationMinutes || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailHistoryPage
