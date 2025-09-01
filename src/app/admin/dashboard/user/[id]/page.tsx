'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileImage,
  User,
  Calendar,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// 목업 데이터 (실제로는 API에서 가져와야 함)
const MOCK_DATA = [
  {
    id: 'user_1',
    loginId: '101234',
    name: '김민수',
    role: 'ADMIN',
    licensePhoto: 'license_1.jpg',
  },
  {
    id: 'user_2',
    loginId: '102567',
    name: '이영희',
    role: 'ADMIN',
    licensePhoto: null,
  },
  {
    id: 'user_3',
    loginId: '103890',
    name: '박철수',
    role: 'ADMIN',
    licensePhoto: 'license_3.jpg',
  },
  {
    id: 'user_4',
    loginId: '104123',
    name: '정수현',
    role: 'ADMIN',
    licensePhoto: null,
  },
  {
    id: 'user_5',
    loginId: '105456',
    name: '최영진',
    role: 'ADMIN',
    licensePhoto: 'license_5.jpg',
  },
  {
    id: 'user_6',
    loginId: '106789',
    name: '한미영',
    role: 'ADMIN',
    licensePhoto: null,
  },
  {
    id: 'user_7',
    loginId: '107012',
    name: '오준호',
    role: 'ADMIN',
    licensePhoto: 'license_7.jpg',
  },
  {
    id: 'user_8',
    loginId: '108345',
    name: '장서연',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_9',
    loginId: '109678',
    name: '윤대현',
    role: 'WORKER',
    licensePhoto: 'license_9.jpg',
  },
  {
    id: 'user_10',
    loginId: '110901',
    name: '강지현',
    role: 'WORKER',
    licensePhoto: null,
  },
  // ... 나머지 데이터는 필요에 따라 추가
] as const

type User = {
  id: string
  loginId: string
  name: string
  role: 'ADMIN' | 'WORKER'
  licensePhoto: string | null
}

const UserDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const [isEditing, setIsEditing] = React.useState(false)

  // ID로 직원 찾기
  const employee = MOCK_DATA.find(user => user.id === params.id) as
    | User
    | undefined

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            직원을 찾을 수 없습니다
          </h1>
          <Button onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm(`정말로 '${employee.name}' 직원을 삭제하시겠습니까?`)) {
      // TODO: API 호출로 삭제
      console.log('삭제:', employee)
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                목록
              </Button>
              <div className="h-6 border-l border-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                직원 상세정보
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-1" />
                {isEditing ? '취소' : '수정'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                삭제
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 기본 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                기본 정보
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사번
                  </label>
                  <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {employee.loginId}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {employee.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    역할
                  </label>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        employee.role === 'ADMIN'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      {employee.role === 'ADMIN' ? '관리자' : '작업자'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    등록일
                  </label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    2024년 1월 15일
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 공정면허증 카드 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FileImage className="w-5 h-5 mr-2 text-gray-600" />
                공정면허증
              </h2>
            </div>
            <div className="p-6">
              {employee.licensePhoto ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      면허증이 등록되어 있습니다.
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <FileImage className="w-4 h-4 mr-1" />
                        보기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        교체
                      </Button>
                    </div>
                  </div>
                  {/* 실제로는 이미지를 표시 */}
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <FileImage className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">면허증 이미지</p>
                      <p className="text-xs text-gray-400">
                        {employee.licensePhoto}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileImage className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    면허증이 등록되지 않았습니다
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    공정면허증을 업로드해주세요.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <FileImage className="w-4 h-4 mr-1" />
                    면허증 등록
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UserDetailPage
