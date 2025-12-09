'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileSpreadsheet, Download, Settings, Search, Plus, X } from 'lucide-react'
import { format } from 'date-fns'

// 목업 데이터: 작업장 현황 스냅샷
const mockSnapshots = [
  {
    id: '1',
    date: '2025-12-09',
    time: '08:00',
    recordCount: 156,
    createdAt: new Date('2025-12-09T08:00:00'),
  },
  {
    id: '2',
    date: '2025-12-09',
    time: '12:00',
    recordCount: 158,
    createdAt: new Date('2025-12-09T12:00:00'),
  },
  {
    id: '3',
    date: '2025-12-09',
    time: '15:00',
    recordCount: 160,
    createdAt: new Date('2025-12-09T15:00:00'),
  },
  {
    id: '4',
    date: '2025-12-08',
    time: '17:00',
    recordCount: 154,
    createdAt: new Date('2024-12-08T17:00:00'),
  },
  {
    id: '5',
    date: '2024-12-08',
    time: '00:00',
    recordCount: 148,
    createdAt: new Date('2024-12-08T00:00:00'),
  },
]

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

// 초기 백업 시간 설정 (목업)
const initialBackupTimes = ['00:00', '05:00', '08:00', '12:00', '15:00', '17:00']

const ExportsPage = () => {
  const [selectedTimes, setSelectedTimes] = useState<string[]>(initialBackupTimes)
  const [isEditingTimes, setIsEditingTimes] = useState(false)
  const [newTime, setNewTime] = useState('')

  // 작업장 현황 기록 날짜 필터
  const [snapshotDate, setSnapshotDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // 불량 기록 날짜 필터
  const [searchStartDate, setSearchStartDate] = useState('')
  const [searchEndDate, setSearchEndDate] = useState('')

  const handleAddTime = () => {
    if (!newTime) {
      alert('시간을 입력해주세요')
      return
    }

    // 중복 체크
    if (selectedTimes.includes(newTime)) {
      alert('이미 등록된 시간입니다')
      return
    }

    // 시간 추가 및 정렬
    const updatedTimes = [...selectedTimes, newTime].sort()
    setSelectedTimes(updatedTimes)
    setNewTime('') // 입력 필드 초기화
  }

  const handleRemoveTime = (timeToRemove: string) => {
    if (selectedTimes.length === 1) {
      alert('최소 1개 이상의 백업 시간이 필요합니다')
      return
    }
    setSelectedTimes(selectedTimes.filter((time) => time !== timeToRemove))
  }

  const handleSaveTimeSettings = () => {
    if (selectedTimes.length === 0) {
      alert('최소 1개 이상의 백업 시간을 설정해주세요')
      return
    }
    alert(`백업 시간이 저장되었습니다: ${selectedTimes.join(', ')}`)
    setIsEditingTimes(false)
  }

  const handleSnapshotDownload = (snapshotId: string) => {
    const snapshot = mockSnapshots.find((s) => s.id === snapshotId)
    alert(`스냅샷 다운로드: ${snapshot?.date} ${snapshot?.time} (${snapshot?.recordCount}건)`)
  }

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

  // 선택한 날짜의 스냅샷만 필터링
  const filteredSnapshots = mockSnapshots.filter((snapshot) => snapshot.date === snapshotDate)

  return (
    <div className="flex flex-col space-y-8">
      {/* 작업장 현황 기록 섹션 */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">작업장 현황 기록</h2>
              <p className="text-sm text-gray-500">
                정해진 시간에 자동으로 백업된 작업장 현황 데이터
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingTimes(!isEditingTimes)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            백업 시간 설정
          </Button>
        </div>

        {/* 백업 시간 설정 UI */}
        {isEditingTimes && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">자동 백업 시간 관리</h3>

            {/* 시간 추가 입력 */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="시간 선택"
                  className="w-full"
                />
              </div>
              <Button onClick={handleAddTime} size="sm" className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                추가
              </Button>
            </div>

            {/* 등록된 시간 목록 */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">
                등록된 백업 시간 ({selectedTimes.length}개)
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTimes.map((time) => (
                  <div
                    key={time}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                  >
                    <span>{time}</span>
                    <button
                      onClick={() => handleRemoveTime(time)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      title="삭제"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {selectedTimes.length === 0 && (
                <p className="text-sm text-gray-400 italic">등록된 백업 시간이 없습니다</p>
              )}
            </div>

            {/* 저장/취소 버튼 */}
            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <Button onClick={handleSaveTimeSettings} size="sm">
                저장
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditingTimes(false)}>
                취소
              </Button>
            </div>
          </div>
        )}

        {/* 현재 백업 시간 표시 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">현재 백업 시간:</span> {selectedTimes.join(', ')}
          </p>
        </div>

        {/* 날짜 필터 */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">조회 날짜</label>
            <Input
              type="date"
              value={snapshotDate}
              onChange={(e) => setSnapshotDate(e.target.value)}
              className="w-auto"
            />
            <div className="text-sm text-gray-500">({filteredSnapshots.length}건의 백업 기록)</div>
          </div>
        </div>

        {/* 스냅샷 목록 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">날짜</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  백업 시간
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  레코드 수
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  생성 일시
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  다운로드
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSnapshots.map((snapshot) => (
                <tr key={snapshot.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900">{snapshot.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {snapshot.time}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {snapshot.recordCount.toLocaleString()}건
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {format(snapshot.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSnapshotDownload(snapshot.id)}
                      className="flex items-center gap-1 mx-auto"
                    >
                      <Download className="w-4 h-4" />
                      엑셀
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 데이터 없을 때 메시지 */}
          {filteredSnapshots.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {snapshotDate}에 백업된 기록이 없습니다
            </div>
          )}
        </div>
      </section>

      {/* 불량 유출 사례 기록 섹션 */}
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  발생시간
                </th>
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
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {record.workerName}
                  </td>
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
    </div>
  )
}

export default ExportsPage
