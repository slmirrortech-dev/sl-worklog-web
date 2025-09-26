'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShiftType, WorkStatus } from '@prisma/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'
import { SearchStatesType } from '@/app/admin/(main)/work-log/_hooks/useSearchWorkLog'
import { CustomDatePicker } from '@/components/CustomDatePicker'
import { displayWorkStatus } from '@/lib/utils/shift-status'
import { subDays, subMonths } from 'date-fns'
import { useExcelDownload } from '@/hooks/useExcelDownload'
import { WorkLogResponseModel } from '@/types/work-log'

const DATA_RANGE = ['오늘', '1주일', '1개월']

const SearchBarWorkLog = ({
  searchStates,
  resetFilters,
  workLogData = [],
}: {
  searchStates: SearchStatesType
  resetFilters: () => void
  workLogData?: WorkLogResponseModel[]
}) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    shiftType,
    setShiftType,
    workStatus,
    setWorkStatus,
    lineName,
    setLineName,
    lineClassNo,
    setLineClassNo,
    processName,
    setProcessName,
    searchName,
    setSearchName,
    progress,
    setProgress,
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
      if (workLogData.length === 0) {
        alert('다운로드할 데이터가 없습니다.')
        return
      }
      await downloadWorkLogExcel(workLogData, '작업기록')
    } catch (error) {
      alert('엑셀 다운로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      {/* 검색 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="flex items-end gap-2">
            {DATA_RANGE.map((item, index) => (
              <Button
                key={item + index}
                variant={activeRange === item ? 'default' : 'outline'}
                size="default"
                onClick={() => handleDateRange(index)}
              >
                {item}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <div className="space-y-2 flex-1">
              <Label>진행 여부</Label>
              <Select
                value={progress}
                onValueChange={(value) => setProgress(value as 'ALL' | 'END' | 'NOT_END')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="NOT_END">진행 중</SelectItem>
                  <SelectItem value="END">종료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2 flex-1">
              <Label>시간대</Label>
              <Select
                value={shiftType}
                onValueChange={(value) => setShiftType(value as ShiftType | 'ALL')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value={ShiftType.DAY}>주간</SelectItem>
                  <SelectItem value={ShiftType.NIGHT}>야간</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 작업상태 */}
            <div className="space-y-2 flex-1">
              <Label>작업장 상태</Label>
              <Select
                value={workStatus}
                onValueChange={(value) => setWorkStatus(value as WorkStatus | 'ALL')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value={WorkStatus.NORMAL}>
                    {displayWorkStatus(WorkStatus.NORMAL)}
                  </SelectItem>
                  <SelectItem value={WorkStatus.OVERTIME}>
                    {displayWorkStatus(WorkStatus.OVERTIME)}
                  </SelectItem>
                  <SelectItem value={WorkStatus.EXTENDED}>
                    {displayWorkStatus(WorkStatus.EXTENDED)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 반번호 */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="lineClassNo">반</Label>
              <Select value={lineClassNo} onValueChange={(value) => setLineClassNo(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 라인명 */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="lineName">라인명</Label>
              <Input
                id="lineName"
                placeholder="라인명 검색"
                value={lineName}
                onChange={(e) => setLineName(e.target.value)}
              />
            </div>

            {/* 공정명 */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="processName">공정명</Label>
              <Input
                id="processName"
                placeholder="공정명 검색"
                value={processName}
                className="w-full"
                onChange={(e) => setProcessName(e.target.value)}
              />
            </div>

            {/* 직원 검색 */}
            <div className="flex-1">
              <Label htmlFor="searchName">직원 검색</Label>
              <Input
                id="searchName"
                placeholder="이름 또는 사번으로 검색"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="outline"
            className="bg-green-700 text-white hover:bg-green-800 hover:text-white"
            onClick={handleExcelDownload}
            disabled={isDownloading || workLogData.length === 0}
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

export default SearchBarWorkLog
