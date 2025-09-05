'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Upload, User, Shield, IdCard, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NewUser {
  id: string
  loginId: string
  name: string
  role: 'ADMIN' | 'WORKER'
  licensePhoto: File | null
  licensePhotoPreview: string | null
}

/** 신규 직원 등록 */
const NewUsersPage = () => {
  const router = useRouter()
  const [users, setUsers] = useState<NewUser[]>([
    {
      id: '1',
      loginId: '',
      name: '',
      role: 'WORKER',
      licensePhoto: null,
      licensePhotoPreview: null,
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addUser = () => {
    const newUser: NewUser = {
      id: Date.now().toString(),
      loginId: '',
      name: '',
      role: 'WORKER',
      licensePhoto: null,
      licensePhotoPreview: null,
    }
    setUsers([...users, newUser])
  }

  const removeUser = (id: string) => {
    if (users.length > 1) {
      setUsers(users.filter((user) => user.id !== id))
    }
  }

  const updateUser = (
    id: string,
    field: keyof Omit<NewUser, 'id' | 'licensePhoto' | 'licensePhotoPreview'>,
    value: string,
  ) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, [field]: value } : user)))
  }

  const handleFileUpload = (id: string, file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUsers(
          users.map((user) =>
            user.id === id
              ? { ...user, licensePhoto: file, licensePhotoPreview: e.target?.result as string }
              : user,
          ),
        )
      }
      reader.readAsDataURL(file)
    } else {
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, licensePhoto: null, licensePhotoPreview: null } : user,
        ),
      )
    }
  }

  const validateUsers = () => {
    for (const user of users) {
      if (!user.loginId.trim()) {
        alert('사번은 필수입니다.')
        return false
      }
      if (!user.name.trim()) {
        alert('이름은 필수입니다.')
        return false
      }
    }

    // 사번 중복 체크 (입력한 사용자들 간)
    const loginIds = users.map((user) => user.loginId.trim())
    const duplicates = loginIds.filter((id, index) => loginIds.indexOf(id) !== index)
    if (duplicates.length > 0) {
      alert(`중복된 사번이 있습니다: ${duplicates.join(', ')}`)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateUsers()) {
      return
    }

    setIsSubmitting(true)
    try {
      // 1단계: 기본 정보로 사용자들 생성
      const usersData = users.map((user) => ({
        loginId: user.loginId.trim(),
        name: user.name.trim(),
        role: user.role,
      }))

      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(usersData),
      })

      const createResult = await createResponse.json()
      if (!createResult.success) {
        alert(createResult.error || '사용자 등록에 실패했습니다.')
        return
      }

      // 2단계: 생성된 사용자 ID로 면허증 업로드
      const createdUsers = createResult.data || []
      const uploadPromises = []

      for (const user of users) {
        if (user.licensePhoto) {
          // loginId로 생성된 사용자 찾기
          const createdUser = createdUsers.find((cu: any) => cu.loginId === user.loginId.trim())

          if (createdUser) {
            const formData = new FormData()
            formData.append('file', user.licensePhoto)

            const uploadPromise = fetch(`/api/users/${createdUser.id}/license-photo`, {
              method: 'POST',
              credentials: 'include',
              body: formData,
            })

            uploadPromises.push(uploadPromise)
          }
        }
      }

      // 모든 이미지 업로드 완료 대기
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises)
      }

      alert(`${createResult.createdCount}명의 직원이 등록되었습니다.`)
      router.push('/admin/users')
    } catch (error) {
      console.error('직원 등록 실패:', error)
      alert('직원 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/*/!* 헤더 *!/*/}
      {/*<header className="bg-white shadow-sm border-b">*/}
      {/*  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">*/}
      {/*    <div className="flex items-center justify-between h-16">*/}
      {/*      <div className="flex items-center gap-4">*/}
      {/*        <Button*/}
      {/*          variant="ghost"*/}
      {/*          size="sm"*/}
      {/*          onClick={() => router.push('/admin/users')}*/}
      {/*          className="text-gray-600 hover:text-gray-900"*/}
      {/*        >*/}
      {/*          <ArrowLeft className="w-4 h-4 mr-1" />*/}
      {/*          목록*/}
      {/*        </Button>*/}
      {/*        <div className="h-6 border-l border-gray-300" />*/}
      {/*        <h1 className="text-xl font-semibold text-gray-900">신규 직원 등록</h1>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</header>*/}

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-gray-600" />
                    직원 {index + 1}
                  </h2>
                  {users.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUser(user.id)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 왼쪽: 공정면허증 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <FileImage className="w-4 h-4 inline mr-1" />
                      공정면허증
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(user.id, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`file-${user.id}`}
                        />
                        <label
                          htmlFor={`file-${user.id}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
                        >
                          <Upload className="w-4 h-4" />
                          파일 선택
                        </label>
                        {user.licensePhoto && (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleFileUpload(user.id, null)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            삭제
                          </Button>
                        )}
                      </div>
                      {user.licensePhoto && (
                        <span className="text-sm text-gray-600 block">
                          {user.licensePhoto.name}
                        </span>
                      )}
                      {user.licensePhotoPreview ? (
                        <div className="w-full max-w-sm h-50 py-4 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                          <img
                            src={user.licensePhotoPreview}
                            alt="면허증 미리보기"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-sm h-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <div className="text-center text-gray-400">
                            <FileImage className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">면허증 이미지</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽: 기본 정보 */}
                  <div className="space-y-6">
                    {/* 사번 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <IdCard className="w-4 h-4 inline mr-1" />
                        사번 *
                      </label>
                      <Input
                        value={user.loginId}
                        onChange={(e) => updateUser(user.id, 'loginId', e.target.value)}
                        placeholder="사번을 입력하세요"
                        className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* 이름 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        이름 *
                      </label>
                      <Input
                        value={user.name}
                        onChange={(e) => updateUser(user.id, 'name', e.target.value)}
                        placeholder="이름을 입력하세요"
                        className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* 역할 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Shield className="w-4 h-4 inline mr-1" />
                        역할
                      </label>
                      <Select
                        value={user.role}
                        onValueChange={(value: 'ADMIN' | 'WORKER') =>
                          updateUser(user.id, 'role', value)
                        }
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 직원 추가 버튼 */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={addUser}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              추가
            </Button>
          </div>

          {/* 등록 버튼 */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/admin/users')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-base"
            >
              취소
            </Button>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700 px-8  text-base"
            >
              {isSubmitting ? '등록 중...' : `${users.length}명 등록`}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NewUsersPage
