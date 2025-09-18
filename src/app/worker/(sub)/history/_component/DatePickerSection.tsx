'use client'

import React from 'react'
import { format, addDays, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const DatePickerSection = ({
  startDate,
  setStartDate,
}: {
  startDate: Date
  setStartDate: (value: Date) => void
}) => {
  return (
    <div className="flex justify-between items-center">
      <button
        title="이전"
        className="p-2"
        onClick={() => {
          const previousDay = subDays(startDate, 1)
          setStartDate(format(previousDay, 'yyyy-MM-dd'))
        }}
      >
        <ChevronLeft className="w-7 h-8 text-gray-900" />
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex-grow-1 text-xl font-semibold flex justify-center items-center gap-2"
            suppressHydrationWarning
          >
            <CalendarIcon className="h-5 w-5 " />
            {format(startDate, 'yyyy년 MM월 dd일', { locale: ko })}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate ? startDate : undefined}
            onSelect={(date) => {
              if (date) {
                setStartDate(format(date, 'yyyy-MM-dd'))
              }
            }}
            disabled={(date) => date > new Date()}
            locale={ko}
          />
        </PopoverContent>
      </Popover>

      <button
        title="다음"
        disabled={startDate === format(new Date(), 'yyyy-MM-dd')}
        className={`p-2 disabled:opacity-10`}
        onClick={() => {
          const nextDay = addDays(startDate, 1)
          setStartDate(format(nextDay, 'yyyy-MM-dd'))
        }}
      >
        <ChevronRight className="w-7 h-8 text-gray-900" />
      </button>
    </div>
  )
}

export default DatePickerSection
