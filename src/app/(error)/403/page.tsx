import React from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

const Page403 = () => {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-blue-600">403</p>
        <h1 className="break-keep mt-4 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          접근 권한이 없습니다.
        </h1>
        <p className="mt-6 text-base font-medium text-pretty text-gray-500 sm:text-xl/8">
          관리자 페이지는 관리자만 접근 가능합니다.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href={ROUTES.WORKER.HOME}
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            작업자 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Page403
