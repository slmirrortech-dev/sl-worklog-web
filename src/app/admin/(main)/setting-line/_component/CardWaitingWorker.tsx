import React from 'react'
import { Clock, User } from 'lucide-react'
import { waitingWorkerModel } from '@/types/line-with-process'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const CardWaitingWorker = ({
  waitingWorker,
  isActive,
  startedAt,
}: {
  waitingWorker: waitingWorkerModel
  isActive: boolean
  startedAt?: Date
}) => {
  return (
    <div className="text-center flex flex-col items-center gap-0.5">
      <span className="flex items-center justify-center gap-1 text-base font-medium text-blue-900">
        {isActive ? (
          <span className="relative flex h-2.5 w-2.5 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
        ) : (
          <User className="w-4 h-4" />
        )}
        {waitingWorker.name}
      </span>
      <span className="text-sm text-blue-600">사번 : {waitingWorker.userId}</span>
      {isActive && startedAt && (
        <span className="flex items-center justify-center gap-1 text-xs text-blue-600">
          <Clock className="w-3 h-3" />
          {format(startedAt, 'MM-dd HH:mm', { locale: ko })}
        </span>
      )}
    </div>
  )
}

export default CardWaitingWorker
