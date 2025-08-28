import React from 'react'
import { AlertCircle, User } from 'lucide-react'
import Image from 'next/image'

const WorklogPage = () => {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-sm">
        <header className="px-6 py-6 bg-primary-50 flex items-center justify-between">
          <Image src="/logo.png" alt="회사 로고" width={38} height={38} />
          <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
            <User className="w-6 h-6 text-primary-900" />
          </button>
        </header>
        <section className="px-6 pt-4 pb-8 bg-primary-50">
          <h1 className="text-2xl font-display">
            <strong>최승혁</strong>님,
            <br />
            오늘도 안전하고
            <br />
            힘찬 하루 되세요!
          </h1>
          {/*<div className="rounded-3xl ring-1 ring-gray-900/10 px-6 py-6">*/}
          {/*  <h2>현재 작업 상태</h2>*/}
          {/*  <p>작업 진행 중</p>*/}
          {/*</div>*/}
          <button
            type="submit"
            className="mt-6 w-full bg-primary-900 text-white py-4 px-6 text-2xl font-medium rounded-xl focus:outline-none"
          >
            작업 시작하기
          </button>
        </section>

        <section className="px-6 py-8">
          <h2 className="text-xl font-semibold mb-6">오늘 작업 기록</h2>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">오늘 작업 내역이 없습니다.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default WorklogPage
