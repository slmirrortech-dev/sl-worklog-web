import React from 'react'
import prisma from '@/lib/core/prisma'
import { workLogResponseModel } from '@/types/work-log'
import { format } from 'date-fns'

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
  })) as workLogResponseModel

  console.log(workLog)

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white px-4 py-6">
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{format(workLog.startedAt, 'yyyy-MM-dd')}</h1>
            <p className="text-base text-gray-500">배정 받은 작업을 선택해주세요.</p>
          </div>
          <strong>시작시간</strong>
          <p>{format(workLog.startedAt, 'yyyy-MM-dd HH:mm')}</p>
          <strong>종료시간</strong>
          <p>{format(workLog.endedAt!, 'yyyy-MM-dd HH:mm')}</p>
          <strong>총 작업시간</strong>
          <p>{workLog.durationMinutes}분</p>
          <strong>라인</strong>
          <p>{workLog.processShift.process.line.name}</p>
          <strong>반</strong>
          <p>{workLog.processShift.process.line.classNo}</p>
          <strong>공정</strong>
          <p>{workLog.processShift.process.name}</p>
          <strong>시간대</strong>
          <p>{workLog.processShift.type}</p>
          <strong>상태</strong>
          <p>{workLog.processShift.status}</p>
        </section>
      </div>
    </div>
  )
}

export default DetailHistoryPage
