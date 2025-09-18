import React from 'react'
import { getServerSession } from '@/lib/utils/auth-guards'
import TopContents from '@/app/worker/home/_component/TopContents'
import prisma from '@/lib/core/prisma'
import { workLogResponseModel } from '@/types/work-log'
import HistoryContents from '@/app/worker/home/_component/HistoryContents'

/** 홈 페이지 */
const HomePage = async () => {
  const session = await getServerSession()

  const userActiveWorkLog = (await prisma.workLog.findFirst({
    where: {
      userId: session?.id,
      endedAt: null,
    },
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

  const userFinishedWorkLogs = (await prisma.workLog.findMany({
    where: {
      userId: session?.id,
      endedAt: { not: null },
    },
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
    take: 5,
    orderBy: { endedAt: 'desc' },
  })) as workLogResponseModel[]

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
      <HistoryContents userFinishedWorkLogs={userFinishedWorkLogs.length > 0 ? userFinishedWorkLogs : null} />
    </>
  )
}

export default HomePage
