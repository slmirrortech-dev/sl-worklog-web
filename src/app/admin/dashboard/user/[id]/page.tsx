'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, FileImage, User, Calendar, Shield, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TUser } from '@/types/TUser'
import { format } from 'date-fns'

const UserDetailPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [user, setUser] = useState<TUser | null>(null)
  const params = useParams()
  const router = useRouter()
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedRole, setEditedRole] = useState<'ADMIN' | 'WORKER'>('WORKER')
  const [isSaving, setIsSaving] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isUploadingLicense, setIsUploadingLicense] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        // 현재 로그인한 사용자 정보와 상세 사용자 정보를 동시에 가져오기
        const [userResponse, currentUserResponse] = await Promise.all([
          fetch(`/api/users/${params.id}`, { credentials: 'include' }),
          fetch('/api/auth/me', { credentials: 'include' }),
        ])

        const userResponseData = await userResponse.json()
        const currentUserData = await currentUserResponse.json()

        // 현재 로그인한 사용자 ID 설정
        if (currentUserData.success && currentUserData.user) {
          setCurrentUserId(currentUserData.user.id)
        }

        if (userResponseData.success) {
          if (userResponseData.data) {
            setUser(userResponseData.data)
            setEditedName(userResponseData.data.name)
            setEditedRole(userResponseData.data.role)
          } else {
            // 데이터 없으면 에러표시
            setIsError(true)
          }
        } else {
          console.error(userResponseData.error || '사용자 목록을 불러오는데 실패했습니다.')
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

    fetchData()
  }, [])

  const handleSave = async () => {
    if (!user || !editedName.trim()) {
      alert('이름은 필수입니다.')
      return
    }

    setIsSaving(true)
    try {
      const updateData: { name: string; role?: 'ADMIN' | 'WORKER' } = {
        name: editedName.trim(),
      }

      // 자기 자신이 아닐 때만 역할 변경 허용
      if (user.id !== currentUserId) {
        updateData.role = editedRole
      }

      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      const responseData = await response.json()

      if (responseData.success) {
        // 성공 시 사용자 데이터 업데이트
        const updatedUser = {
          ...user,
          name: editedName.trim(),
          // 자기 자신이 아닐 때만 역할 업데이트
          role: user.id !== currentUserId ? editedRole : user.role,
        }
        setUser(updatedUser)
        setIsEditing(false)
        alert('사용자 정보가 수정되었습니다.')
      } else {
        console.error('사용자 수정 실패:', responseData.error)
        alert(responseData.error || '사용자 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('사용자 수정 실패:', error)
      alert('사용자 수정에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setEditedName(user.name)
      setEditedRole(user.role)
    }
    setIsEditing(false)
  }

  const refetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        credentials: 'include',
      })
      const responseData = await response.json()

      if (responseData.success && responseData.data) {
        setUser(responseData.data)
      }
    } catch (error) {
      console.error('사용자 정보 갱신 실패:', error)
    }
  }

  const handleLicenseUpload = async (file: File) => {
    if (!user) return

    setIsUploadingLicense(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/users/${user.id}/license-photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const responseData = await response.json()

      if (responseData.success) {
        alert('면허증이 등록되었습니다.')
        // 서버에서 최신 정보 다시 가져오기
        await refetchUser()
      } else {
        alert(responseData.error || '면허증 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('면허증 업로드 실패:', error)
      alert('면허증 등록에 실패했습니다.')
    } finally {
      setIsUploadingLicense(false)
    }
  }

  const handleLicenseDelete = async () => {
    if (!user || !confirm('면허증을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/users/${user.id}/license-photo`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const responseData = await response.json()

      if (responseData.success) {
        alert('면허증이 삭제되었습니다.')
        // 서버에서 최신 정보 다시 가져오기
        await refetchUser()
      } else {
        alert(responseData.error || '면허증 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('면허증 삭제 실패:', error)
      alert('면허증 삭제에 실패했습니다.')
    }
  }

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
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isEditing}
                    className="border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* 왼쪽: 공정면허증 */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FileImage className="w-4 h-4 inline mr-1" />
                    공정면허증
                  </label>
                  <div className="space-y-4">
                    {user?.licensePhoto ? (
                      <div className="space-y-4">
                        {/* 면허증 이미지 표시 */}
                        <div className="relative group w-full max-w-sm h-50 p-2 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 cursor-pointer">
                          <img
                            src={user.licensePhoto}
                            alt="공정면허증"
                            className="w-full h-full object-contain"
                          />
                          {/* 호버 시 표시되는 오버레이 */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowImageModal(true)
                              }}
                              className="bg-white text-gray-800 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              확대보기
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLicenseDelete()
                              }}
                              variant="destructive"
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-sm h-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                          <FileImage className="w-8 h-8 mx-auto mb-6" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleLicenseUpload(file)
                              }
                            }}
                            className="hidden"
                            id="license-upload"
                          />
                          <label
                            htmlFor="license-upload"
                            className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm cursor-pointer transition-colors ${
                              isUploadingLicense
                                ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
                                : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            <FileImage className="w-4 h-4" />
                            {isUploadingLicense ? '업로드 중...' : '업로드'}
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 오른쪽: 기본 정보 */}
                <div className="lg:col-span-3 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사번</label>
                    <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      {user?.loginId}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                    {isEditing ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-lg h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="이름을 입력하세요"
                      />
                    ) : (
                      <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                        {user?.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                    {isEditing ? (
                      user?.id === currentUserId ? (
                        // 자기 자신일 때는 역할 변경 불가
                        <div className="h-12 flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
                          <Shield className="w-4 h-4 mr-2" />
                          {user?.role === 'ADMIN' ? '관리자' : '작업자'} (본인 변경 불가)
                        </div>
                      ) : (
                        <Select
                          value={editedRole}
                          onValueChange={(value: 'ADMIN' | 'WORKER') => setEditedRole(value)}
                        >
                          <SelectTrigger className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WORKER">
                              <div className="flex items-center">
                                <Shield className="w-4 h-4 mr-2" />
                                작업자
                              </div>
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              <div className="flex items-center">
                                <Shield className="w-4 h-4 mr-2" />
                                관리자
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )
                    ) : (
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
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">등록일시</label>
                    <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500 min-w-4" />
                      {user?.createdAt && format(user.createdAt, 'yyyy년 MM월 dd일 HH:mm:ss')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 편집 모드일 때 저장/취소 버튼 */}
            {isEditing && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 이미지 모달 */}
      {showImageModal && user?.licensePhoto && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={user.licensePhoto}
              alt="공정면허증 확대보기"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              size="sm"
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 bg-white text-gray-800 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDetailPage
