'use client'

import React, { useState } from 'react'
import { logoutApi } from '@/lib/api/auth-api'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, LogOut, Key, Shield, IdCard } from 'lucide-react'

const MyPagePage = () => {
  const router = useRouter()
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  // TODO: 실제 사용자 정보는 API나 context에서 가져와야 함
  const userInfo = {
    userId: 'admin',
    name: '김관리',
    role: '관리자',
    birthday: '970426'
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (passwords.new.length < 6) {
      alert('비밀번호는 최소 6자리 이상이어야 합니다.')
      return
    }

    // TODO: 비밀번호 변경 API 호출
    try {
      console.log('비밀번호 변경:', passwords)
      alert('비밀번호가 변경되었습니다.')
      setShowPasswordChange(false)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      alert('비밀번호 변경에 실패했습니다.')
    }
  }

  const handleLogout = async () => {
    if (confirm('로그아웃하시겠습니까?')) {
      try {
        await logoutApi()
        router.push(ROUTES.ADMIN.LOGIN)
      } catch (error) {
        console.error(error)
        alert('로그아웃에 실패했습니다.')
      }
    }
  }

  return (
    <div className="flex flex-col space-y-6 max-w-2xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-3 mb-8">
        <User className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">내 정보</h1>
      </div>

      {/* 사용자 정보 카드 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <IdCard className="h-4 w-4" />
              <span>사번</span>
            </div>
            <p className="text-gray-900 font-mono text-lg">{userInfo.userId}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              <span>이름</span>
            </div>
            <p className="text-gray-900 text-lg">{userInfo.name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Shield className="h-4 w-4" />
              <span>역할</span>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {userInfo.role}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Key className="h-4 w-4" />
              <span>생년월일</span>
            </div>
            <p className="text-gray-900 font-mono text-lg">{userInfo.birthday}</p>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">보안 설정</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="flex items-center space-x-2"
          >
            <Lock className="h-4 w-4" />
            <span>비밀번호 변경</span>
          </Button>
        </div>

        {showPasswordChange && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">현재 비밀번호</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">새 비밀번호</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordChange(false)
                  setPasswords({ current: '', new: '', confirm: '' })
                }}
              >
                취소
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={!passwords.current || !passwords.new || !passwords.confirm}
              >
                변경하기
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 로그아웃 버튼 */}
      <div className="flex justify-center pt-4">
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>로그아웃</span>
        </Button>
      </div>
    </div>
  )
}

export default MyPagePage
