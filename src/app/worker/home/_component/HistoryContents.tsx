import React from 'react'
import { workLogResponseModel } from '@/types/work-log'
import { format } from 'date-fns'
import { AlertCircle, ArrowRightIcon, ChevronRight, Plus } from 'lucide-react'

const HistoryContents = ({
  userFinishedWorkLogs,
}: {
  userFinishedWorkLogs: workLogResponseModel[] | null
}) => {
  return (
    <section className="px-6 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">최근 작업 기록</h2>
        {userFinishedWorkLogs && (
          <button className="flex items-center px-3 py-1 border border-gray-400 text-gray-600 text-sm font-medium rounded-full">
            더 보기
          </button>
        )}
      </div>
      {userFinishedWorkLogs && userFinishedWorkLogs.length > 0 ? (
        <ul className="space-y-4">
          {userFinishedWorkLogs.map((item: workLogResponseModel) => {
            return (
              <li
                key={item.id}
                className="flex justify-between items-center rounded-xl ring-1 ring-gray-200 bg-white px-4 py-3 mb-4 drop-shadow-md drop-shadow-gray-100"
              >
                <div>
                  <p className="text-xl font-semibold">{format(item.startedAt, 'yyyy-MM-dd')}</p>
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
            )
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
