import React from 'react'

const UserDetailLoading = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-200 animate-pulse rounded mr-2" />
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-12 bg-gray-200 animate-pulse rounded" />
                <div className="h-8 w-12 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* 공정면허증 */}
              <div className="lg:col-span-2">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="w-full h-56 bg-gray-100 animate-pulse rounded-lg" />
              </div>

              {/* 기본 정보 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 사번 */}
                <div>
                  <div className="h-4 w-8 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-12 bg-gray-50 animate-pulse rounded-lg" />
                </div>

                {/* 이름 */}
                <div>
                  <div className="h-4 w-8 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-12 bg-gray-50 animate-pulse rounded-lg" />
                </div>

                {/* 역할 */}
                <div>
                  <div className="h-4 w-8 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
                </div>

                {/* 생년월일 */}
                <div>
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-12 bg-gray-50 animate-pulse rounded-lg" />
                </div>

                {/* 등록일시 */}
                <div>
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-12 bg-gray-50 animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default UserDetailLoading
