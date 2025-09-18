import React from 'react'

/** 작업시작 스켈레톤 */
const Loading = () => {
  return (
    <div className="min-h-screen flex justify-center px-6 py-6">
      <div className="w-full max-w-sm">
        <div className="space-y-6">
          <div className="h-7 bg-gray-300 rounded w-28 animate-pulse"></div>

          <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>

          <div>
            <div className="h-6 bg-gray-300 rounded w-20 mb-2 animate-pulse"></div>
            <div className="w-full h-16 bg-gray-200 rounded-sm animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading
