'use client'

import React, { useEffect, useState } from 'react'
import DatePickerSection from '@/app/worker/(sub)/history/_component/DatePickerSection'
import { workLogResponseModel } from '@/types/work-log'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { getMyDailyWorkLogApi } from '@/lib/api/work-log-api'

const HistoryList = () => {
  const [historyData, setHistoryData] = useState<workLogResponseModel[]>([])
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState<boolean>()

  const fetch = async () => {
    setIsLoading(true)
    try {
      const { data } = await getMyDailyWorkLogApi(format(startDate, 'yyyy-MM-dd'))
      setHistoryData(data)
    } catch (error) {
      setHistoryData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetch().then()
  }, [startDate])

  return (
    <div>
      <DatePickerSection startDate={startDate} setStartDate={setStartDate} />
      <div className="mt-4">
        {isLoading ? (
          <>로딩중...</>
        ) : (
          <>
            {historyData.length > 0 ? (
              <ul className="space-y-4">
                {historyData.map((item: workLogResponseModel) => (
                  <li
                    key={item.id}
                    className="flex justify-between items-center rounded-xl ring-1 ring-gray-200 bg-white px-4 py-3 mb-4 drop-shadow-md drop-shadow-gray-100"
                  >
                    <div>
                      <p className="text-xl font-semibold">
                        {format(item.startedAt, 'yyyy-MM-dd')}
                      </p>
                      <div className="flex gap-1 text-base text-gray-500 flex-wrap">
                        <p>{format(item.startedAt, 'HH:mm:ss')}</p>~
                        <p>
                          <span>
                            {format(item.startedAt, 'yyyy-MM-dd') !==
                              format(item.endedAt!, 'yyyy-MM-dd') && '다음날 '}
                          </span>
                          {format(item.endedAt!, 'HH:mm:ss')}
                        </p>
                        | {item.durationMinutes}분
                      </div>
                      <p className="flex gap-4 mt-2">
                        <span className="flex gap-1 text-lg text-primary-500 font-semibold">
                          {item.processShift.process.line.name}
                          <span className="text-lg text-gray-600 font-normal">
                            {item.processShift.process.line.classNo}반
                          </span>
                        </span>
                        <span className="text-lg text-gray-600 font-semibold">
                          {item.processShift.process.name}
                        </span>
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-300" />
                  </li>
                ))}
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
