'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw, Search } from 'lucide-react'
import { SearchStatesType } from '@/app/admin/(main)/exports/_hooks/useSearchWorkplaceLog'
import { CustomDatePicker } from '@/components/CustomDatePicker'
import { subDays, subMonths } from 'date-fns'
import { Label } from '@/components/ui/label'

const DATA_RANGE = ['오늘', '1주일', '1개월']

const SearchBarWorkplaceLog = ({
  searchStates,
  resetFilters,
}: {
  searchStates: SearchStatesType
  resetFilters: () => void
}) => {
  const { startDate, setStartDate, endDate, setEndDate, handleSearch } = searchStates

  // 활성화 된 기간
  const [activeRange, setActiveRange] = useState<(typeof DATA_RANGE)[number]>(DATA_RANGE[0])

  // 기간 변경에 따라 검색일 변경
  const handleDateRange = (index: number) => {
    setActiveRange(DATA_RANGE[index])
    const today = new Date()

    if (DATA_RANGE[index] === '오늘') {
      setEndDate(today)
      setStartDate(today)
    }

    if (DATA_RANGE[index] === '1주일') {
      setEndDate(today)
      setStartDate(subDays(today, 7))
    }
    if (DATA_RANGE[index] === '1개월') {
      setEndDate(today)
      setStartDate(subMonths(today, 1))
    }
  }

  // 날짜 범위가 변경되면 activeRange 자동 업데이트
  useEffect(() => {
    const today = new Date()
    const todayStr = today.toDateString()
    const startStr = startDate.toDateString()
    const endStr = endDate.toDateString()

    // 오늘인지 확인
    if (startStr === todayStr && endStr === todayStr) {
      setActiveRange('오늘')
      return
    }

    // 1주일인지 확인 (시작일이 7일 전, 종료일이 오늘)
    const oneWeekAgo = subDays(today, 7)
    if (startStr === oneWeekAgo.toDateString() && endStr === todayStr) {
      setActiveRange('1주일')
      return
    }

    // 1개월인지 확인 (시작일이 1개월 전, 종료일이 오늘)
    const oneMonthAgo = subMonths(today, 1)
    if (startStr === oneMonthAgo.toDateString() && endStr === todayStr) {
      setActiveRange('1개월')
      return
    }

    // 어떤 범위에도 해당하지 않으면 activeRange 초기화
    setActiveRange('')
  }, [startDate, endDate])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        {/* 검색 조건 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 날짜 선택 */}
          <CustomDatePicker
            label="검색 시작일"
            date={startDate}
            onChangeAction={setStartDate}
            max={startDate <= endDate ? endDate : undefined}
          />
          <CustomDatePicker
            label="검색 종료일"
            date={endDate}
            onChangeAction={setEndDate}
            min={startDate}
            max={new Date()}
          />
          {/* 기간 선택 버튼 */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-gray-700">기간 선택</Label>
            <div className="flex gap-2">
              {DATA_RANGE.map((item, index) => (
                <Button
                  key={item + index}
                  variant={activeRange === item ? 'default' : 'outline'}
                  size="sm"
                  className="min-w-[70px]"
                  onClick={() => handleDateRange(index)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-end justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="w-4 h-4 mr-1" />
              초기화
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSearch}
            >
              <Search className="w-4 h-4 mr-1" />
              검색
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchBarWorkplaceLog
