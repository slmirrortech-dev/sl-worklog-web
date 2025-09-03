'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useAuthCheck } from '@/lib/auth-utils'

const WorklogPage = () => {
  // 세션 기반 인증 확인 (작업자와 관리자 모두 접근 가능)
  const { user, isLoading } = useAuthCheck(['WORKER', 'ADMIN'])

  const [todayWorkHistory, _setTodayWorkHistory] = useState([
    {
      startDate: '2026-08-28 20:00:10',
      endDate: '2026-08-29 08:04:06',
      line: '라인 1',
      work: '공정 2',
    },
    {
      startDate: '2026-08-27 10:03:20',
      endDate: '2026-08-27 18:23:10',
      line: '라인 3',
      work: '공정 1',
    },
  ])
  const [startInfo, setStartInfo] = useState<null | {
    line: string
    work: string
  }>(null)
  const [startTime, setStartTime] = useState<null | string>(null)
  const [workerInfo, setWorkerInfo] = useState<{ employeeId: string; name: string } | null>(null)

  useEffect(() => {
    const startInfo = localStorage.getItem('start-info')
    const startTime = localStorage.getItem('start-time')
    const workerInfo = localStorage.getItem('worker-info')

    if (startInfo) {
      setStartInfo({
        line: startInfo.split('/')[0],
        work: startInfo.split('/')[1],
      })
    }

    if (startTime) {
      setStartTime(startTime)
    }

    // 워커 정보는 세션에서 우선 가져오고, 없으면 localStorage에서 가져오기
    if (user) {
      setWorkerInfo({
        employeeId: user.loginId,
        name: user.name,
      })
    } else if (workerInfo) {
      setWorkerInfo(JSON.parse(workerInfo))
    }
  }, [user])

  // 로딩 중이거나 인증되지 않았다면 빈 페이지 표시
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  const endWork = () => {
    localStorage.removeItem('start-info')
    localStorage.removeItem('start-time')
    setStartInfo(null)
    setStartTime(null)
  }

  return (
    <div className="min-h-screen flex justify-center ">
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
              <strong>{workerInfo?.name || '사용자'}</strong>님,
              <br />
              작업이 진행 중이에요.
            </h1>
          ) : (
            <h1 className="text-2xl font-display mb-6">
              <strong>{workerInfo?.name || '사용자'}</strong>님,
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
                      {format(startTime, 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
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
          <h2 className="text-xl font-semibold mb-4">최근 작업 기록</h2>
          {todayWorkHistory.length > 0 ? (
            <ul className="space-y-4">
              {todayWorkHistory.map((item) => {
                return (
                  <li
                    key={item.startDate}
                    className="flex justify-between rounded-xl ring-1 ring-gray-200 bg-white px-4 py-5 mb-4 drop-shadow-md drop-shadow-gray-100"
                  >
                    <div>
                      <p className="text-xl font-semibold">
                        {format(item.startDate, 'yyyy-MM-dd')}
                      </p>
                      <span className="text-lg text-gray-500">
                        {item.line} / {item.work}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg">{format(item.startDate, 'HH:mm:ss')}</p>
                      <p className="text-lg">
                        <span>
                          {format(item.startDate, 'yyyy-MM-dd') !==
                            format(item.endDate, 'yyyy-MM-dd') && '다음날 '}
                        </span>
                        {format(item.endDate, 'HH:mm:ss')}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">종료된 작업이 없습니다.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default WorklogPage
