import React from 'react'

const NoData = ({ name = '' }: { name: string }) => {
  return (
    <main className="grid h-screen place-items-center bg-gray-50 px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center pb-30">
        <p className="text-xl font-semibold text-blue-600">{name}</p>
        <h1 className="break-keep mt-4 sm:text-5xl text-2xl font-semibold tracking-tight text-balance text-gray-900">
          등록된 라인이 없습니다.
        </h1>
        <p className="mt-6 text-base font-medium text-pretty text-gray-500 sm:text-xl/8">
          관리자 모드에서 작업장 설정을 해주세요.
        </p>
      </div>
    </main>
  )
}

export default NoData
