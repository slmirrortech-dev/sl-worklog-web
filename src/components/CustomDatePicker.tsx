'use client'

import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Matcher } from 'react-day-picker'

export function CustomDatePicker({
  label = '',
  date,
  onChangeAction,
  min,
  max,
  className,
}: {
  label?: string
  date: Date | null
  onChangeAction: (value: Date) => void
  min?: Date
  max?: Date
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  //
  // // HH:mm:ss string 으로 변환
  // const formatTime = (d: Date) =>
  //   `${d.getHours().toString().padStart(2, '0')}:${d
  //     .getMinutes()
  //     .toString()
  //     .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`

  return (
    <div className="flex gap-4 flex-1">
      {/* 날짜 선택 */}
      <div className="flex flex-col gap-3 w-full">
        {label && (
          <Label htmlFor="date-picker" className="px-1">
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className={`justify-between font-normal ${className}`}
            >
              {date ? format(date, 'yyyy-MM-dd', { locale: ko }) : '날짜 선택'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date || undefined}
              captionLayout="dropdown"
              locale={ko}
              disabled={
                [min ? { before: min } : undefined, max ? { after: max } : undefined].filter(
                  Boolean,
                ) as Matcher[]
              }
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  // 기존 시간 유지 + 날짜만 교체 (date가 null이면 현재 시간 사용)
                  const newDate = date ? new Date(date) : new Date()
                  newDate.setFullYear(selectedDate.getFullYear())
                  newDate.setMonth(selectedDate.getMonth())
                  newDate.setDate(selectedDate.getDate())
                  onChangeAction(newDate)
                }
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/*/!* 시간 선택 *!/*/}
      {/*<div className="flex flex-col gap-3">*/}
      {/*  <Label htmlFor="time-picker" className="px-1">*/}
      {/*    {label} 시간*/}
      {/*  </Label>*/}
      {/*  <Input*/}
      {/*    type="time"*/}
      {/*    [id]="time-picker"*/}
      {/*    step="1"*/}
      {/*    value={formatTime(date)}*/}
      {/*    onChange={(e) => {*/}
      {/*      const [hh, mm, ss] = e.target.value.split(':').map(Number)*/}
      {/*      const newDate = new Date(date)*/}
      {/*      newDate.setHours(hh, mm, ss || 0, 0)*/}
      {/*      onChangeAction(newDate)*/}
      {/*    }}*/}
      {/*    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"*/}
      {/*  />*/}
      {/*</div>*/}
    </div>
  )
}
