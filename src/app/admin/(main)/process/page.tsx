import React from 'react'
import ProcessSetting from '@/app/admin/(main)/process/(component)/ProcessSetting'

/** 작업장 설정 */
const ProcessPage = () => {
  return (
    <div className="flex flex-col space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">작업장 설정</h1>
            <p className="text-gray-600 mt-2">
              라인과 공정을 관리하여 작업자 앱에서 선택할 수 있도록 설정하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 작업장 설정 */}
      <ProcessSetting />
    </div>
  )
}

export default ProcessPage
