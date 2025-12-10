'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, RotateCcw, Search } from 'lucide-react'
import { SearchStatesType } from '@/app/admin/(main)/exports/_hooks/useSearchDefectLog'
import { CustomDatePicker } from '@/components/CustomDatePicker'
import { subDays, subMonths } from 'date-fns'
import { useExcelDownload } from '@/hooks/useExcelDownload'
import { DefectLogResponse } from '@/types/defect-log'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DATA_RANGE = ['오늘', '1주일', '1개월']

const SearchBarDefectLog = ({
  searchStates,
  resetFilters,
  logData = [],
}: {
  searchStates: SearchStatesType
  resetFilters: () => void
  logData?: DefectLogResponse[]
}) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    shiftType,
    setShiftType,
    lineName,
    setLineName,
    className,
    setClassName,
    processName,
    setProcessName,
    worker,
    setWorker,
    memo,
    setMemo,
    handleSearch,
  } = searchStates

  // 활성화 된 기간
  const [activeRange, setActiveRange] = useState<(typeof DATA_RANGE)[number]>(DATA_RANGE[0])

  // 엑셀 다운로드 훅
  const { downloadWorkLogExcel, isDownloading } = useExcelDownload()

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

  // 엑셀 다운로드 처리
  const handleExcelDownload = async () => {
    try {
      if (logData.length === 0) {
        alert('다운로드할 데이터가 없습니다.')
        return
      }
      await downloadWorkLogExcel(logData, '불량유출기록')
    } catch (error) {
      alert('엑셀 다운로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      {/* 검색 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">교대조</label>
              <Select value={shiftType} onValueChange={setShiftType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="DAY">주간</SelectItem>
                  <SelectItem value="NIGHT">야간</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">라인명</label>
              <Input
                type="text"
                placeholder="라인명 검색"
                value={lineName}
                onChange={(e) => setLineName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">반 이름</label>
              <Input
                type="text"
                placeholder="1반, 2반, 서브반 등"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">공정명</label>
              <Input
                type="text"
                placeholder="공정명 검색"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">작업자</label>
              <Input
                type="text"
                placeholder="이름 또는 사번"
                value={worker}
                onChange={(e) => setWorker(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">메모</label>
              <Input
                type="text"
                placeholder="메모 검색"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="default"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" />
            검색
          </Button>
          <Button
            variant="outline"
            className="bg-green-700 text-white hover:bg-green-800 hover:text-white"
            onClick={handleExcelDownload}
            disabled={isDownloading || logData.length === 0}
          >
            <Download className="w-4 h-4" />
            {isDownloading ? '다운로드 중...' : 'Excel 다운로드'}
          </Button>
          <Button variant="outline" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4" />
            검색 조건 초기화
          </Button>
        </div>
      </div>
    </>
  )
}

export default SearchBarDefectLog