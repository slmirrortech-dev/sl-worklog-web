import React from 'react'

/** 마이페이지 스켈레톤 */
const Loading = () => {
  return (
    <div className="min-h-[calc(100vh-60px)] flex justify-center bg-gray-50">
      <div className="w-full max-w-sm px-6 py-6 flex flex-col">
        {/* 로그인 정보 스켈레톤 */}
        <div className="flex-1">
          <div className="h-7 bg-gray-300 rounded-md w-24 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 스켈레톤 */}
        <div className="w-full h-14 bg-gray-200 rounded-xl mt-8 animate-pulse"></div>
      </div>
    </div>
  )
}

export default Loading
