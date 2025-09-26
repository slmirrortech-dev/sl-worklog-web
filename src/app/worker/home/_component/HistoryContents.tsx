'use client'

import React from 'react'
import { WorkLogResponseModel } from '@/types/work-log'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { useLoading } from '@/contexts/LoadingContext'
import CardWorkLog from '@/components/worker/CardWorkLog'

const HistoryContents = ({
  userFinishedWorkLogs,
}: {
  userFinishedWorkLogs: WorkLogResponseModel[] | null
}) => {
  const router = useRouter()
  const { showLoading } = useLoading()

  const handleMoreClick = () => {
    showLoading()
    router.push(ROUTES.WORKER.HISTORY)
  }

  return (
    <section className="px-6 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">최근 작업 기록</h2>
        {userFinishedWorkLogs && (
          <button
            onClick={handleMoreClick}
            className="flex items-center px-3 py-1 border border-gray-400 text-gray-600 text-sm font-medium rounded-full"
          >
            더 보기
          </button>
        )}
      </div>
      {userFinishedWorkLogs && userFinishedWorkLogs.length > 0 ? (
        <ul className="space-y-4">
          {userFinishedWorkLogs.map((item: WorkLogResponseModel) => {
            return <CardWorkLog key={item.id} worklog={item} />
          })}
        </ul>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-400">종료된 작업이 없습니다.</p>
        </div>
      )}
    </section>
  )
}

export default HistoryContents
