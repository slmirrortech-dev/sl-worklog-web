'use client'

import { useState } from 'react'
import { Play, Square, RotateCcw, User } from 'lucide-react'

export default function WorklogPage() {
  const [currentLine, setCurrentLine] = useState('A-01')
  const [workStatus, setWorkStatus] = useState<'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'>('NOT_STARTED')
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  
  const handleStartWork = () => {
    setStartTime(new Date())
    setWorkStatus('IN_PROGRESS')
  }

  const handleEndWork = () => {
    setEndTime(new Date())
    setWorkStatus('COMPLETED')
  }

  const handleLineChange = (newLine: string) => {
    setCurrentLine(newLine)
  }

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--'
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const lines = ['A-01', 'A-02', 'B-01', 'B-02', 'C-01', 'C-02']

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary-50 p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <User className="w-8 h-8 text-primary-600" />
          <div>
            <p className="font-semibold text-xl text-gray-900">홍길동</p>
            <p className="text-lg text-gray-600">작업자</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-600">현재 시간</p>
          <p className="font-mono text-2xl font-bold">
            {new Date().toLocaleTimeString('ko-KR', { hour12: false })}
          </p>
        </div>
      </div>

      {/* Work Status */}
      <div className="bg-white border-2 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">작업 현황</h2>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xl text-gray-600">작업 상태</span>
            <span className={`px-4 py-2 rounded-full text-lg font-semibold ${
              workStatus === 'NOT_STARTED' 
                ? 'bg-gray-100 text-gray-700'
                : workStatus === 'IN_PROGRESS'
                ? 'bg-green-100 text-green-700'
                : 'bg-primary-100 text-primary-700'
            }`}>
              {workStatus === 'NOT_STARTED' 
                ? '시작 전' 
                : workStatus === 'IN_PROGRESS' 
                ? '작업 중' 
                : '완료'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xl text-gray-600">현재 라인</span>
            <span className="font-mono text-3xl font-bold text-primary-600">
              {currentLine}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t-2">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">시작 시간</p>
              <p className="font-mono text-2xl font-bold">
                {formatTime(startTime)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">종료 시간</p>
              <p className="font-mono text-2xl font-bold">
                {formatTime(endTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Work Controls */}
      <div className="space-y-4">
        {workStatus === 'NOT_STARTED' && (
          <button
            onClick={handleStartWork}
            className="w-full bg-green-600 text-white py-6 px-8 rounded-xl text-xl font-semibold flex items-center justify-center space-x-3 hover:bg-green-700"
          >
            <Play className="w-6 h-6" />
            <span>작업 시작</span>
          </button>
        )}

        {workStatus === 'IN_PROGRESS' && (
          <button
            onClick={handleEndWork}
            className="w-full bg-red-600 text-white py-6 px-8 rounded-xl text-xl font-semibold flex items-center justify-center space-x-3 hover:bg-red-700"
          >
            <Square className="w-6 h-6" />
            <span>작업 종료</span>
          </button>
        )}

        {workStatus === 'COMPLETED' && (
          <button
            onClick={() => {
              setWorkStatus('NOT_STARTED')
              setStartTime(null)
              setEndTime(null)
            }}
            className="w-full bg-primary-600 text-white py-6 px-8 rounded-xl text-xl font-semibold flex items-center justify-center space-x-3 hover:bg-primary-700"
          >
            <RotateCcw className="w-6 h-6" />
            <span>새 작업 시작</span>
          </button>
        )}
      </div>

      {/* Line Change */}
      <div className="bg-white border-2 rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-6">작업라인 변경</h3>
        <div className="grid grid-cols-2 gap-4">
          {lines.map((line) => (
            <button
              key={line}
              onClick={() => handleLineChange(line)}
              className={`py-6 px-6 rounded-xl text-xl font-semibold transition-colors ${
                currentLine === line
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {line}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
