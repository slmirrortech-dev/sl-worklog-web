'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, FileImage, User, Calendar, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TUser } from '@/types/TUser'
import { format } from 'date-fns'

const UserDetailPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [user, setUser] = useState<TUser | null>(null)
  const params = useParams()
  const router = useRouter()
  const [isEditing, setIsEditing] = React.useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const response = await fetch(`/api/users/${params.id}`, {
          credentials: 'include',
        })

        const responseData = await response.json()

        if (responseData.success) {
          if (responseData.data) {
            setUser(responseData.data)
          } else {
            // 데이터 없으면 에러표시
            setIsError(true)
          }
        } else {
          console.error(responseData.error || '사용자 목록을 불러오는데 실패했습니다.')
          setIsError(true)
          return
        }
      } catch (_error: unknown) {
        console.error('fetch failed', _error)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (!user && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 스켈레톤 */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                <div className="h-6 border-l border-gray-300" />
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 스켈레톤 */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* 기본 정보 카드 스켈레톤 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                  </div>
                  <div>
                    <div className="h-4 w-8 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                  </div>
                  <div>
                    <div className="h-4 w-8 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
                  </div>
                  <div>
                    <div className="h-4 w-12 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* 공정면허증 카드 스켈레톤 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="p-6">
                <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user && isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">직원을 찾을 수 없습니다</h1>
          <Button onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    if (
      confirm(
        `정말로 '${user?.name ?? ''}' 직원을 삭제하시겠습니까?\n\n` +
          `삭제된 기존 데이터는 복구할 수 없습니다.\n` +
          `관련 작업 기록과 첨부 파일도 함께 삭제됩니다.`,
      )
    ) {
      try {
        const handleFetch = await fetch(`/api/users/${params.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })

        const data = await handleFetch.json()
        if (data.success) {
          alert('삭제 완료 되었습니다.')
          router.push('/admin/dashboard')
        } else {
          console.error('사용자 삭제 실패')
          return
        }
      } catch (error) {
        console.error(error, '사용자 삭제 실패')
      }
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
              <h1 className="text-xl font-semibold text-gray-900">직원 상세정보</h1>
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
              <div className="flex items-center justify-between flex-wrap gap-2.5">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  기본 정보
                </h2>
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
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">사번</label>
                  <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {user?.loginId}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    {user?.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">등록일시</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500 min-w-4" />
                    {user?.createdAt && format(user.createdAt, 'yyyy년 MM월 dd일 HH:mm:ss')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium ${
                        user?.role === 'ADMIN'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      {user?.role === 'ADMIN' ? '관리자' : '작업자'}
                    </span>
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
              {user?.licensePhoto ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">면허증이 등록되어 있습니다.</span>
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
                      <p className="text-xs text-gray-400">{user.licensePhoto}</p>
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
                  <p className="text-sm text-gray-500 mb-4">공정면허증을 업로드해주세요.</p>
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
