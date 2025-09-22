import React from 'react'
import { ROUTES } from '@/lib/constants/routes'
import { format } from 'date-fns'
import { displayMinutes } from '@/lib/utils/time'
import { ChevronRight } from 'lucide-react'
import { workLogResponseModel } from '@/types/work-log'
import { useLoading } from '@/contexts/LoadingContext'
import { useRouter } from 'next/navigation'
import ShiftTypeLabel from '@/components/admin/ShiftTypeLabel'

const CardWorkLog = ({ worklog }: { worklog: workLogResponseModel }) => {
  const router = useRouter()
  const { showLoading } = useLoading()

  if (!worklog?.processShift) {
    return null
  }

  return (
    <li
      onClick={() => {
        showLoading()
        router.push(`${ROUTES.WORKER.HISTORY}/${worklog.id}`)
      }}
      className="flex justify-between items-center rounded-xl ring-1 ring-gray-200 bg-white px-4 py-3 mb-4 drop-shadow-md drop-shadow-gray-100"
    >
      <div>
        {/*<p className="text-sm font-normal text-gray-500">*/}
        {/*  {displayMinutes(worklog?.durationMinutes || 0)}*/}
        {/*</p>*/}
        <p className="flex gap-3 mb-2">
          <ShiftTypeLabel shiftType={worklog.processShift.type} size={'sm'} />
          <span className="flex gap-1 text-lg text-gray-800 font-semibold">
            {worklog.processShift.process.line.name}
            <span className="text-lg text-gray-600 font-normal">
              {worklog.processShift.process.line.classNo}반
            </span>
          </span>
          <span className="text-lg text-gray-600 font-semibold">
            {worklog.processShift.process.name}
          </span>
        </p>
        <p className="text-base font-semibold">
          {format(worklog.startedAt, 'yyyy-MM-dd')}{' '}
          <span className="font-normal text-gray-500">{format(worklog.startedAt, 'HH:mm')}</span>
        </p>
        <p className="text-base font-semibold">
          {format(worklog.endedAt!, 'yyyy-MM-dd')}{' '}
          <span className="font-normal text-gray-500">{format(worklog.endedAt!, 'HH:mm')}</span>
        </p>
      </div>
      <ChevronRight className="w-6 h-6 text-gray-300" />
    </li>
  )
}

export default CardWorkLog
