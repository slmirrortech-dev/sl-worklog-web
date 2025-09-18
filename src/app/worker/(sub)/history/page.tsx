import React from 'react'
import HistoryList from '@/app/worker/(sub)/history/_component/HistoryList'

const HistoryPage = () => {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-gray-50 px-4 py-6">
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">작업 기록</h1>
            <p className="text-base text-gray-500">날짜별 작업 기록을 확인 할 수 있습니다.</p>
          </div>
          <HistoryList />
        </section>
      </div>
    </div>
  )
}

export default HistoryPage
