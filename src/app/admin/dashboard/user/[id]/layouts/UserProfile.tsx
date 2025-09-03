'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { UserModel } from '@/types/models/user.model'
import { Calendar, Edit, Eye, FileImage, Shield, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUser, updateUser } from '@/lib/api/user'
import type { UpdateUserDto } from '@/types/dto/user.dto'
import LicenseBox from '@/app/admin/dashboard/user/[id]/layouts/LicenseBox'
import { useRouter } from 'next/navigation'

/** 기본 정보 */
const UserProfile = ({ user }: { user: UserModel }) => {
  const router = useRouter()
  const currentUserId = user.id // TODO : 실제 로그인한 아이디로 변경
  const [freshUser, setFreshUser] = useState(user)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedRole, setEditedRole] = useState<'WORKER' | 'ADMIN'>(user.role)
  const [editedName, setEditedName] = useState(user.name)

  const handleCancel = () => {
    if (freshUser) {
      setEditedName(freshUser.name)
      setEditedRole(freshUser.role)
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!freshUser || !editedName.trim()) {
      alert('이름을 입력해주세요.')
      return
    }

    // 변경사항 없으면 그냥 종료
    const hasChanges = editedName !== freshUser.name || editedRole !== freshUser.role
    if (!hasChanges) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      // 변경된 필드만 PATCH
      const updateData: Partial<UpdateUserDto> = {}
      if (editedName !== freshUser.name) updateData.name = editedName
      if (editedRole && editedRole !== freshUser.role) updateData.role = editedRole

      await updateUser(freshUser.id, updateData)

      // 서버에서 최신 상태 다시 불러오기
      const updatedUser = await getUser(freshUser.id)
      setFreshUser(updatedUser)
      setEditedName(updatedUser.name)
      setEditedRole(updatedUser.role)
    } catch (err) {
      console.error(err)
      alert((err as Error).message || '저장 중 오류가 발생했습니다.')
    } finally {
      alert('수정 완료되었습니다.')
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    if (
      confirm(
        `정말로 '${user?.name ?? ''}(${user?.loginId ?? ''})' 직원을 삭제하시겠습니까?\n\n` +
          `삭제된 기존 데이터는 복구할 수 없습니다.\n` +
          `관련 작업 기록과 첨부 파일도 함께 삭제됩니다.`,
      )
    ) {
      try {
        const handleFetch = await fetch(`/api/users/${user.id}`, {
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
          {/* 공정면허증 */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FileImage className="w-4 h-4 inline mr-1" />
              공정면허증
            </label>
            <LicenseBox
              id={freshUser.id}
              licensePhoto={freshUser.licensePhoto}
              onUploadComplete={async () => {
                const updatedUser = await getUser(freshUser.id)
                setFreshUser(updatedUser)
              }}
            />
          </div>

          {/* 오른쪽: 기본 정보 */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">사번</label>
              <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {freshUser.loginId}
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
                  {freshUser.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
              {isEditing ? (
                freshUser.id == currentUserId ? (
                  <div className="h-12 flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500">
                    <Shield className="w-4 h-4 mr-2" />
                    {freshUser.role === 'ADMIN' ? '관리자' : '작업자'} (본인 변경 불가)
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
                      freshUser.role === 'ADMIN'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    {freshUser.role === 'ADMIN' ? '관리자' : '작업자'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">등록일시</label>
              <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                <Calendar className="w-4 h-4 mr-2 text-gray-500 min-w-4" />
                {freshUser.createdAt && format(freshUser.createdAt, 'yyyy년 MM월 dd일 HH:mm:ss')}
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
  )
}

export default UserProfile
