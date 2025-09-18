'use client'

import React from 'react'
import HeadText from '@/app/worker/home/_component/HeadText'
import { SessionUser } from '@/lib/core/session'
import { ROUTES } from '@/lib/constants/routes'
import { useRouter } from 'next/navigation'
import CardActiveWorkLog from '@/app/worker/home/_component/CardActiveWorkLog'
import { workLogResponseModel } from '@/types/work-log'

const TopContents = ({
  currentUser,
  userActiveWorkLog,
}: {
  currentUser: SessionUser | null
  userActiveWorkLog: workLogResponseModel | null
}) => {
  const router = useRouter()

  return (
    <section className="px-6 pb-6 bg-primary-50">
      <HeadText
        username={currentUser?.name}
        text={userActiveWorkLog ? '작업이 진행 중이에요.' : '오늘도 안전하고\n힘찬 하루 되세요!'}
      />

      {userActiveWorkLog ? (
        <CardActiveWorkLog
          workLogId={userActiveWorkLog.id}
          lineName={userActiveWorkLog.processShift.process.line.name}
          classNo={userActiveWorkLog.processShift.process.line.classNo}
          processName={userActiveWorkLog.processShift.process.name}
          startAt={userActiveWorkLog.startedAt}
        />
      ) : (
        <button
          onClick={() => router.push(ROUTES.WORKER.START)}
          type="button"
          className="w-full bg-primary-900 text-white py-4 px-6 text-2xl font-medium rounded-xl focus:outline-none transition-colors"
        >
          작업 시작하기
        </button>
      )}
    </section>
  )
}

export default TopContents
