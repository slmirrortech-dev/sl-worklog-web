'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function WorkerLoginPage() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login/worker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // 작업자 정보를 localStorage에 저장 (호환성을 위해)
        localStorage.setItem(
          'worker-info',
          JSON.stringify({
            employeeId: data.user.loginId,
            name: data.user.name,
          })
        )
        // 인증 컨텍스트에도 저장
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/worklog')
      } else {
        const errorData = await response.json()
        alert(errorData.error || '사번 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('로그인 중 오류가 발생했습니다.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* 회사 로고 */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/logo.png"
              alt="회사 로고"
              width={110}
              height={110}
              className="mx-auto mb-8"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            작업 시간 기록
          </h1>
          <p className="text-lg text-gray-600">사번으로 로그인해주세요</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="id"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              사번
            </label>
            <input
              type="id"
              id="id"
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="사번을 입력하세요"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-900 text-white py-4 px-6 text-xl font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
