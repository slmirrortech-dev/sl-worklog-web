import React from 'react'

const Loading = () => {
  return (
    <>
      {/* HomeHeader 스켈레톤 */}
      <header className="px-6 py-6 bg-primary-50 flex items-center justify-between">
        <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
      </header>

      {/* TopContents 스켈레톤 */}
      <section className="px-6 pb-6 bg-primary-50">
        {/* HeadText 스켈레톤 */}
        <div className="py-6">
          <div className="h-8 bg-gray-200 rounded-lg w-32 mb-2 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
        </div>

        {/* 작업 시작 버튼/활성 작업 카드 스켈레톤 */}
        <div className="w-full bg-gray-200 rounded-xl h-16 animate-pulse"></div>
      </section>

      {/* HistoryContents 스켈레톤 */}
      <section className="px-6 py-6">
        {/* 섹션 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-full w-16 animate-pulse"></div>
        </div>

        {/* 작업 기록 아이템들 스켈레톤 */}
        <ul className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <li
              key={index}
              className="flex justify-between items-center rounded-xl ring-1 ring-gray-200 bg-white px-4 py-3 mb-4 drop-shadow-md drop-shadow-gray-100"
            >
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded-lg w-28 mb-2 animate-pulse"></div>
                <div className="flex gap-2 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Loading
