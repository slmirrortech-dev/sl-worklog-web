import { User, Settings, Monitor } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import React from 'react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8 md:mb-12">
          <Image
            src="/logo.webp"
            alt="회사 로고"
            width={110}
            height={38}
            priority
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">
            작업장 관리 시스템
          </h1>
          <p className="text-base md:text-lg text-gray-600">원하는 모드를 선택해주세요</p>
        </div>

        {/* 메뉴 카드들 */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* 관리자 */}
          <Link
            href={ROUTES.ADMIN.LOGIN}
            target="_blank"
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 p-4 md:p-8 text-center"
          >
            <div className="bg-blue-100 rounded-full w-14 h-14 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Settings className="text-blue-600 w-7 h-7 md:w-10 md:h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 md:mb-4">관리자</h3>
            <p className="text-gray-600 mb-4 md:mb-6">
              작업장 관리
              <br />
              작업자 관리
            </p>
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
              관리자 모드
            </div>
          </Link>

          {/* 모니터 */}
          <Link
            href={ROUTES.MONITOR}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 p-4 md:p-8 text-center"
          >
            <div className="bg-orange-100 rounded-full w-14 h-14 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Monitor className="text-orange-600 w-7 h-7 md:w-10 md:h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 md:mb-4">모니터</h3>
            <p className="text-gray-600 mb-4 md:mb-6">
              실시간 작업 현황 모니터링
              <br />
              <span>(TV/데스크톱에 최적화)</span>
            </p>
            <div className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">
              모니터 모드
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
