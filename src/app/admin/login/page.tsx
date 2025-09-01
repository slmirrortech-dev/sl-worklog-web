'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'

const AdminLoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('admin-token', 'admin-logged-in')
        // 인증 컨텍스트에 사용자 정보 저장
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/admin/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.error || '아이디 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('로그인 중 오류가 발생했습니다.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md px-8 py-10">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="회사 로고"
              width={100}
              height={100}
              className="mx-auto mb-8"
            />
            <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
            <p className="text-gray-600 mt-2">관리자 계정으로 로그인하세요</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                아이디
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="마스터 아이디를 입력하세요"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
