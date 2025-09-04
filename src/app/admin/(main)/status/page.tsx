'use client'
import React, { useState, useEffect } from 'react'
import { User, Clock, AlertCircle } from 'lucide-react'

// 라인과 공정 데이터 (ProcessSetting에서 가져온 구조)
const linesData = [
  {
    id: '1',
    name: 'MV L/R',
    processes: [
      { id: '1-1', name: 'P1' },
      { id: '1-2', name: 'P2' },
      { id: '1-3', name: 'P3' },
      { id: '1-4', name: 'P4' },
      { id: '1-5', name: 'P5' },
      { id: '1-6', name: 'P6' },
      { id: '1-7', name: 'P7' },
    ],
  },
  {
    id: '2',
    name: 'MX5 LH',
    processes: [
      { id: '2-1', name: 'P1' },
      { id: '2-2', name: 'P2' },
      { id: '2-3', name: 'P3' },
      { id: '2-4', name: 'P4' },
      { id: '2-5', name: 'P5' },
      { id: '2-6', name: 'P6' },
      { id: '2-7', name: 'P7' },
    ],
  },
  {
    id: '3',
    name: 'MX5 RH',
    processes: [
      { id: '3-1', name: 'P1' },
      { id: '3-2', name: 'P2' },
      { id: '3-3', name: 'P3' },
      { id: '3-4', name: 'P4' },
      { id: '3-5', name: 'P5' },
      { id: '3-6', name: 'P6' },
      { id: '3-7', name: 'P7' },
    ],
  },
  {
    id: '25',
    name: '린지원',
    processes: [
      { id: '25-1', name: '서열피더' },
      { id: '25-2', name: '조립피더' },
      { id: '25-3', name: '리워크' },
      { id: '25-4', name: '폴리싱' },
      { id: '25-5', name: '서열대차' },
    ],
  },
]

// 임시 작업자 데이터
const mockWorkerData = {
  '1-1': { name: '김철수', employeeId: '2024001', startTime: '09:00' },
  '1-3': { name: '이영희', employeeId: '2024002', startTime: '09:15' },
  '2-2': { name: '박민수', employeeId: '2024003', startTime: '08:45' },
  '2-5': { name: '정수진', employeeId: '2024004', startTime: '09:30' },
  '3-1': { name: '홍길동', employeeId: '2024005', startTime: '08:30' },
  '25-2': { name: '임도현', employeeId: '2024006', startTime: '09:10' },
  '25-4': { name: '윤서영', employeeId: '2024007', startTime: '09:25' },
}

const StatusPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [workerData, setWorkerData] = useState(mockWorkerData)

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 작업 시간 계산
  const getWorkingTime = (startTime: string) => {
    const [hour, minute] = startTime.split(':').map(Number)
    const start = new Date()
    start.setHours(hour, minute, 0, 0)
    const diff = currentTime.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">실시간 작업 현황</h1>
            <p className="text-gray-600 mt-2">
              현재 시간: {currentTime.toLocaleTimeString('ko-KR')}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>작업 중</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <span>대기</span>
            </div>
          </div>
        </div>
      </div>

      {/* 작업 현황 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b sticky left-0 bg-gray-50 z-10 min-w-[120px]">
                  라인 / 공정
                </th>
                {linesData[0].processes.map((process) => (
                  <th
                    key={process.id}
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-l min-w-[150px]"
                  >
                    {process.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {linesData.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 border-b sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      {line.name}
                    </div>
                  </td>
                  {line.processes.map((process) => {
                    const worker = workerData[process.id as keyof typeof workerData]
                    return (
                      <td
                        key={process.id}
                        className="px-4 py-4 text-center border-b border-l relative"
                      >
                        {worker ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                  {worker.name}
                                </span>
                              </div>
                              <div className="text-xs text-blue-600">사번: {worker.employeeId}</div>
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <Clock className="w-3 h-3" />
                                {getWorkingTime(worker.startTime)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[80px] flex items-center justify-center">
                            <span className="text-xs text-gray-400">대기</span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 작업 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 작업자</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(workerData).length}명</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">가동 공정</p>
              <p className="text-2xl font-bold text-green-600">
                {Object.keys(workerData).length}개
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">대기 공정</p>
              <p className="text-2xl font-bold text-gray-600">
                {linesData.reduce((total, line) => total + line.processes.length, 0) -
                  Object.keys(workerData).length}
                개
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">가동률</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(
                  (Object.keys(workerData).length /
                    linesData.reduce((total, line) => total + line.processes.length, 0)) *
                    100,
                )}
                %
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusPage
