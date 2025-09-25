import React from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import LogoutButton from '@/app/(error)/403/_component/LogoutButton'

const Page403 = () => {
  return (
    <main className="grid h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center pb-30">
        <p className="text-base font-semibold text-blue-600">403</p>
        <h1 className="break-keep mt-4 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          접근 권한이 없습니다.
        </h1>
        <p className="mt-6 text-base font-medium text-pretty text-gray-500 sm:text-xl/8">
          이 페이지는 관리자만 접근할 수 있습니다.
          <br />
          작업자 계정 로그아웃 후 관리자 계정으로 다시 로그인해 주세요.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <LogoutButton />
          <Link href="/" className="text-base font-semibold text-gray-900">
            메인으로 이동 <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Page403
