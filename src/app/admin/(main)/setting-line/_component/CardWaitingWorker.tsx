import React from 'react'
import { Clock, User } from 'lucide-react'
import { waitingWorkerModel } from '@/types/line-with-process'

const CardWaitingWorker = ({ waitingWorker }: { waitingWorker: waitingWorkerModel }) => {
  return (
    <div className="text-center flex flex-col items-center gap-0.5">
      <span className="flex items-center justify-center gap-1 text-base font-medium text-blue-900">
        <User className="w-4 h-4" />
        {waitingWorker.name}
      </span>
      <span className="text-sm text-blue-600">사번 : {waitingWorker.userId}</span>
      <span className="flex items-center justify-center gap-1 text-xs text-blue-600">
        <Clock className="w-3 h-3" />
        14h 36m
      </span>
    </div>
  )
}

export default CardWaitingWorker
