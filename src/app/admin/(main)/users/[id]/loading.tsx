import React from 'react'

const UserDetailLoading = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 스켈레톤 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
              <div className="h-6 border-l border-gray-300" />
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 스켈레톤 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 기본 정보 카드 스켈레톤 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 w-12 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                </div>
                <div>
                  <div className="h-4 w-8 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                </div>
                <div>
                  <div className="h-4 w-8 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
                </div>
                <div>
                  <div className="h-4 w-12 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* 공정면허증 카드 스켈레톤 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="p-6">
              <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UserDetailLoading
