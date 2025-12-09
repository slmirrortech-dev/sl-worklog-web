'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { searchDefectLogsApi, DefectLogSearchParams } from '@/lib/api/defect-log-api'
import { ShiftType } from '@prisma/client'
import { displayShiftType } from '@/lib/utils/shift-type'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const DefectLog = () => {
  // 오늘 날짜와 7일 전 날짜 계산
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)

  // 검색 조건 (기본값: 최근 7일)
  const [searchStartDate, setSearchStartDate] = useState(format(sevenDaysAgo, 'yyyy-MM-dd'))
  const [searchEndDate, setSearchEndDate] = useState(format(today, 'yyyy-MM-dd'))
  const [workerSearch, setWorkerSearch] = useState('')
  const [lineName, setLineName] = useState('')
  const [processName, setProcessName] = useState('')
  const [shiftType, setShiftType] = useState<ShiftType | ''>('')
  const [memo, setMemo] = useState('')

  // 검색 파라미터 상태
  const [searchParams, setSearchParams] = useState<DefectLogSearchParams>({})

  const {
    data: defectData,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['searchDefectLogsApi', searchParams],
    queryFn: () => searchDefectLogsApi(searchParams),
    select: (response) => {
      return response.data || []
    },
  })

  const handleDefectSearch = () => {
    if (!searchStartDate || !searchEndDate) {
      alert('검색 기간을 선택해주세요')
      return
    }

    // 종료일은 23:59:59로 설정
    const endDateTime = `${searchEndDate}T23:59:59`

    const params: DefectLogSearchParams = {
      startDate: searchStartDate,
      endDate: endDateTime,
    }

    if (workerSearch) params.workerSearch = workerSearch
    if (lineName) params.lineName = lineName
    if (processName) params.processName = processName
    if (shiftType) params.shiftType = shiftType as ShiftType
    if (memo) params.memo = memo

    setSearchParams(params)
  }

  const handleDefectDownload = () => {
    if (!defectData || defectData.length === 0) {
      alert('다운로드할 데이터가 없습니다')
      return
    }
    alert(`불량 기록 엑셀 다운로드: ${defectData.length}건`)
  }

  const handleReset = () => {
    setSearchStartDate(format(sevenDaysAgo, 'yyyy-MM-dd'))
    setSearchEndDate(format(today, 'yyyy-MM-dd'))
    setWorkerSearch('')
    setLineName('')
    setProcessName('')
    setShiftType('')
    setMemo('')
    setSearchParams({})
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <FileSpreadsheet className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">불량 유출 사례 기록</h2>
          <p className="text-sm text-gray-500">직원 관리에서 등록된 불량 유출 기록</p>
        </div>
      </div>

      {/* 검색 필터 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시작일 *</label>
            <Input
              type="date"
              max={format(new Date(), 'yyyy-MM-dd')}
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">종료일 *</label>
            <Input
              type="date"
              min={format(searchStartDate, 'yyyy-MM-dd')}
              max={format(new Date(), 'yyyy-MM-dd')}
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">라인명</label>
            <Input
              type="text"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              placeholder="예: MX5 LH"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">교대조</label>
            <RadioGroup
              value={shiftType}
              onValueChange={(value) => setShiftType(value as ShiftType | '')}
              className="flex gap-4 h-10 items-center"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="" id="shift-all" />
                <Label htmlFor="shift-all" className="text-sm font-medium cursor-pointer">
                  전체
                </Label>
              </div>
              {Object.values(ShiftType).map((item: ShiftType) => {
                return (
                  <div className="flex items-center space-x-1.5" key={item}>
                    <RadioGroupItem value={item} id={`shift-${item}`} />
                    <Label htmlFor={`shift-${item}`} className="text-sm font-medium cursor-pointer">
                      {displayShiftType(item)}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">공정명</label>
            <Input
              type="text"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="예: P1"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">작업자</label>
            <Input
              type="text"
              value={workerSearch}
              onChange={(e) => setWorkerSearch(e.target.value)}
              placeholder="이름 또는 사번을 입력하세요"
              className="w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">메모 내용</label>
            <Input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 부품 누락"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <Button onClick={handleDefectSearch} className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            검색
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            초기화
          </Button>
          <Button
            variant="outline"
            onClick={handleDefectDownload}
            className="flex items-center gap-2 ml-auto text-white hover:text-white bg-green-700 hover:bg-green-800"
          >
            <Download className="w-4 h-4 text-white" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isFetching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}

      {/* 에러 상태 */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-600 font-medium">검색 중 오류가 발생했습니다</p>
          <p className="text-sm text-gray-500 mt-2">{error?.message || '알 수 없는 오류'}</p>
        </div>
      )}

      {/* 검색 전 안내 */}
      {!isFetching && !isError && !defectData && (
        <div className="text-center py-12 text-gray-400">
          검색 조건을 입력하고 검색 버튼을 눌러주세요
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!isFetching && !isError && defectData && defectData.length === 0 && (
        <div className="text-center py-12 text-gray-400">검색된 불량 기록이 없습니다</div>
      )}

      {/* 불량 기록 목록 테이블 */}
      {!isFetching && !isError && defectData && defectData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-32 min-w-[128px]">
                  발생일
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24 min-w-[96px]">
                  발생시간
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24 min-w-[96px]">
                  작업자
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24 min-w-[96px]">
                  사번
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-28 min-w-[112px]">
                  라인
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20 min-w-[80px]">
                  교대조
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-20 min-w-[80px]">
                  공정
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[200px]">
                  메모
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {defectData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-center text-sm text-gray-900 whitespace-nowrap">
                    {format(new Date(record.occurredAt), 'yyyy-MM-dd')}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-900 whitespace-nowrap">
                    {format(new Date(record.occurredAt), 'HH:mm')}
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-gray-900 whitespace-nowrap">
                    {record.workerName}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">
                    {record.workerUserId}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">
                    {record.lineName}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">
                    {displayShiftType(record.shiftType)}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">
                    {record.processName}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600 whitespace-nowrap">
                    {record.memo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default DefectLog
