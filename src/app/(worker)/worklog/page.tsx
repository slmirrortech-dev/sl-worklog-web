'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const WorklogPage = () => {
  const [startInfo, setStartInfo] = useState<null | {
    line: string
    work: string
  }>(null)
  const [startTime, setStartTime] = useState<null | string>(null)

  useEffect(() => {
    const startInfo = localStorage.getItem('start-info')
    const startTime = localStorage.getItem('start-time')

    if (startInfo) {
      setStartInfo({
        line: startInfo.split('/')[0],
        work: startInfo.split('/')[1],
      })
    }

    if (startTime) {
      setStartTime(startTime)
    }
  }, [])

  const endWork = () => {
    localStorage.removeItem('start-info')
    localStorage.removeItem('start-time')
    setStartInfo(null)
    setStartTime(null)
  }

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-sm">
        <header className="px-6 py-6 bg-primary-50 flex items-center justify-between">
          <Image src="/logo.png" alt="회사 로고" width={42} height={42} />
          <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
            <User className="w-6 h-6 text-primary-900" />
          </button>
        </header>
        <section className="px-6 pb-6 bg-primary-50">
          {startInfo?.work && startTime ? (
            <h1 className="text-2xl font-display mb-6">
              <strong>최승혁</strong>님,
              <br />
              작업이 진행 중이에요.
            </h1>
          ) : (
            <h1 className="text-2xl font-display mb-6">
              <strong>최승혁</strong>님,
              <br />
              오늘도 안전하고
              <br />
              힘찬 하루 되세요!
            </h1>
          )}
          {startInfo?.work && startTime ? (
            <>
              <div className="rounded-xl bg-white px-6 py-6 mb-4 drop-shadow-md drop-shadow-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-lg font-semibold">현재 작업</p>
                  <span className="text-lg text-gray-600">
                    {startInfo?.line} / {startInfo?.work}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">시작 시간</p>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                    </span>
                    <span className="text-lg text-gray-600">
                      {format(startTime, 'a HH:mm', { locale: ko })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 w-full border-1 botext-primary-500 text-primary-500 py-4 px-6 text-xl font-medium rounded-xl focus:outline-none transition-colors"
                  onClick={endWork}
                >
                  작업 종료하기
                </button>
              </div>
            </>
          ) : (
            <Link href="/start">
              <button
                type="button"
                className="w-full bg-primary-900 text-white py-4 px-6 text-2xl font-medium rounded-xl focus:outline-none transition-colors"
              >
                작업 시작하기
              </button>
            </Link>
          )}
        </section>

        <section className="px-6 py-6">
          <h2 className="text-xl font-semibold mb-6">오늘 작업 기록</h2>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">종료된 작업이 없습니다.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default WorklogPage
