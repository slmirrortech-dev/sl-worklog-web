'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

// 목업 데이터
const lines = [
  { id: 'line1', name: '라인 1' },
  { id: 'line2', name: '라인 2' },
  { id: 'line3', name: '라인 3' },
  { id: 'line4', name: '라인 4' },
  { id: 'line5', name: '라인 5' },
  { id: 'line6', name: '라인 6' },
  { id: 'line7', name: '라인 7' },
  { id: 'line8', name: '라인 8' },
]

const works = [
  { id: 'work1', name: '작업 1' },
  { id: 'work2', name: '작업 2' },
  { id: 'work3', name: '작업 3' },
  { id: 'work4', name: '작업 4' },
  { id: 'work5', name: '작업 5' },
  { id: 'work6', name: '작업 6' },
]

export default function StartPage() {
  const router = useRouter()
  const [selectedLine, setSelectedLine] = useState('')
  const [selectedWork, setSelectedWork] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handleComplete = () => {
    setShowModal(true)
  }

  const confirmStart = () => {
    // TODO: 작업 시작 로직 추가
    setShowModal(false)
    localStorage.setItem(
      'start-info',
      `${lines.find(line => line.id === selectedLine)?.name}/${works.find(work => work.id === selectedWork)?.name}`
    )
    localStorage.setItem('start-time', new Date().toString())
    router.back()
  }

  return (
    <div className="min-h-screen flex justify-center px-6 py-6">
      <div className="w-full max-w-sm">
        <section className="mb-12">
          <h1 className="text-2xl font-bold">작업 시작하기</h1>
          <p className="text-base text-gray-500">
            기록을 위해 정확한 라인을 선택해주세요.
          </p>
        </section>
        <section className="mb-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">라인 선택</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {lines.map(line => (
                <button
                  key={line.id}
                  onClick={() => setSelectedLine(line.id)}
                  className={`flex-shrink-0 px-6 py-4 rounded-xl text-lg font-medium whitespace-nowrap transition-colors ${
                    selectedLine === line.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {line.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">작업 선택</h2>
            <div className="grid grid-cols-2 gap-3">
              {works.map(work => (
                <button
                  key={work.id}
                  onClick={() => setSelectedWork(work.id)}
                  className={`px-6 py-4 rounded-xl text-lg font-medium transition-colors ${
                    selectedWork === work.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {work.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="fixed left-0 bottom-0 right-0 flex">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-white text-gray-600 border-t border-primary-900 py-4 px-6 text-2xl font-medium"
          >
            취소
          </button>
          {selectedLine && selectedWork && (
            <button
              onClick={handleComplete}
              className="flex-1/3 bg-primary-900 text-white border-t border-primary-900 py-4 px-6 text-2xl font-medium"
            >
              선택 완료
            </button>
          )}
        </div>

        {/* 컨펌 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-950/75 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <p className="text-2xl font-bold text-center mb-2">
                작업 선택 확인
              </p>
              <p className="text-lg text-gray-600 text-center mb-6">
                작업을 시작하시겠습니까?
              </p>

              <div className="bg-gray-100 rounded-xl p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-600">
                      라인
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {lines.find(line => line.id === selectedLine)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-600">
                      작업
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {works.find(work => work.id === selectedWork)?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1  text-primary-900 border-1 border-primary-900 py-4 px-6 text-xl font-medium rounded-xl"
                >
                  취소
                </button>
                <button
                  onClick={confirmStart}
                  className="flex-1 bg-primary-900 text-white py-4 px-6 text-xl font-medium rounded-xl"
                >
                  시작
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
