import React, { useState } from 'react'
import { Download, FileSpreadsheet, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// 목업 데이터: 불량 유출 사례
const mockDefectRecords = [
  {
    id: '1',
    date: '2024-12-09',
    time: '08:00',
    workerName: '김철수',
    workerUserId: 'W001',
    lineName: 'ML5 RH',
    shift: '주간',
    process: 'P1',
    memo: '외관 불량 발생 (스크래치)',
  },
  {
    id: '2',
    date: '2024-12-08',
    time: '08:00',
    workerName: '이영희',
    workerUserId: 'W023',
    lineName: 'ML5 RH',
    shift: '주간',
    process: 'P1',
    memo: '치수 불량',
  },
  {
    id: '3',
    date: '2024-12-07',
    time: '08:00',
    workerName: '박민수',
    workerUserId: 'W045',
    lineName: 'ML5 RH',
    shift: '주간',
    process: 'P1',
    memo: '도장 불량 (색상 불일치)',
  },
  {
    id: '4',
    date: '2024-12-06',
    time: '08:00',
    workerName: '최지현',
    workerUserId: 'W067',
    lineName: 'ML5 RH',
    shift: '주간',
    process: 'P1',
    memo: '조립 누락',
  },
]

const DefectLog = () => {
  // 불량 기록 날짜 필터
  const [searchStartDate, setSearchStartDate] = useState('')
  const [searchEndDate, setSearchEndDate] = useState('')

  const handleDefectSearch = () => {
    if (!searchStartDate || !searchEndDate) {
      alert('검색 기간을 선택해주세요')
      return
    }
    alert(`불량 기록 검색: ${searchStartDate} ~ ${searchEndDate}`)
  }

  const handleDefectDownload = () => {
    if (!searchStartDate || !searchEndDate) {
      alert('검색 기간을 선택해주세요')
      return
    }
    alert(`불량 기록 엑셀 다운로드: ${searchStartDate} ~ ${searchEndDate}`)
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
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
            <Input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
            <Input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDefectSearch} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              검색
            </Button>
            <Button
              variant="outline"
              onClick={handleDefectDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              엑셀 다운로드
            </Button>
          </div>
        </div>
      </div>

      {/* 불량 기록 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">발생일</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">발생시간</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">작업자</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">사번</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">라인</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">교대조</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">공정</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">메모</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockDefectRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{record.date}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{record.time}</td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">{record.workerName}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{record.workerUserId}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{record.lineName}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{record.shift}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{record.process}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{record.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mockDefectRecords.length === 0 && (
        <div className="text-center py-12 text-gray-400">검색된 불량 기록이 없습니다</div>
      )}
    </section>
  )
}

export default DefectLog
