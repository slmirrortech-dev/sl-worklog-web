'use client'

import React, { useState } from 'react'
import DatePickerSection from '@/app/worker/(sub)/history/_component/DatePickerSection'
import { WorkLogSnapshotResponseModel } from '@/types/work-log'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { getMyDailyWorkLogApi } from '@/lib/api/work-log-api'
import CardWorkLog from '@/components/worker/CardWorkLog'
import { useQuery } from '@tanstack/react-query'

const HistoryList = () => {
  const [startDate, setStartDate] = useState<Date>(new Date())

  const { data, isPending } = useQuery({
    queryKey: ['dailyWorkLog', startDate],
    queryFn: async () => await getMyDailyWorkLogApi(format(startDate, 'yyyy-MM-dd')),
    select: (response) => {
      if (response.data) {
        return response.data as WorkLogSnapshotResponseModel[]
      } else {
        return []
      }
    },
  })

  return (
    <div>
      <DatePickerSection startDate={startDate} setStartDate={setStartDate} />
      <div className="mt-4">
        {isPending ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {data && data.length > 0 ? (
              <ul className="space-y-4">
                {data.map((item: WorkLogSnapshotResponseModel) => {
                  return <CardWorkLog key={item.id} worklog={item} />
                })}
              </ul>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-400">검색한 날짜에 기록이 없습니다.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HistoryList
