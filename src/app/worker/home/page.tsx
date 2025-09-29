import React from 'react'
import { getServerSession } from '@/lib/utils/auth-guards'
import TopContents from '@/app/worker/home/_component/TopContents'
import prisma from '@/lib/core/prisma'
import { WorkLogResponseModel } from '@/types/work-log'
import HistoryContents from '@/app/worker/home/_component/HistoryContents'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

/** 홈 페이지 */
const HomePage = async () => {
  const session = await getServerSession()

  if (!session) {
    return null
  }

  const userActiveWorkLog = (await prisma.workLog.findFirst({
    where: {
      userId: session.id,
      endedAt: null,
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

  const userFinishedWorkLogs = (await prisma.workLog.findMany({
    where: {
      userId: session.id,
      endedAt: { not: null },
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
    take: 5,
    orderBy: { endedAt: 'desc' },
  })) as WorkLogResponseModel[]

  return (
    <>
      <TopContents
        userActiveWorkLog={userActiveWorkLog || null}
        currentUser={
          session
            ? { id: session.id, userId: session.userId, name: session.name, role: session.role }
            : null
        }
      />
      <HistoryContents
        userFinishedWorkLogs={userFinishedWorkLogs.length > 0 ? userFinishedWorkLogs : null}
      />
    </>
  )
}

export default HomePage
