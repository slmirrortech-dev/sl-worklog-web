'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Upload, User, FileImage, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Role } from '@prisma/client'
import { ROUTES } from '@/lib/constants/routes'
import { getCurrentUserApi, uploadLicenseApi } from '@/lib/api/user-api'
import { CustomDatePicker } from '@/components/CustomDatePicker'
import { format } from 'date-fns'
import useDialogStore from '@/store/useDialogStore'
import ExcelUploadDialog from './_component/ExcelUploadDialog'

interface NewEmployee {
  userId: string
  name: string
  hireDate: Date | null
  role: Role
  licensePhotoFile: File | null
  licensePreviewUrl: string | null
}

/** 신규 직원 등록 */
const NewUsersPage = () => {
  const [currentUserRole, setCurrentUserRole] = useState('MANAGER')
  const { showDialog } = useDialogStore()
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false)

  const router = useRouter()
  const [employee, setEmployee] = useState<NewEmployee>({
    userId: '',
    name: '',
    hireDate: null,
    role: 'WORKER',
    licensePhotoFile: null,
    licensePreviewUrl: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUserRole = async () => {
    const { data } = await getCurrentUserApi()
    setCurrentUserRole(data.role)
  }
  useEffect(() => {
    fetchUserRole().then()
  }, [])

  const updateEmployee = <
    K extends keyof Omit<NewEmployee, 'licensePhotoFile' | 'licensePreviewUrl'>,
  >(
    field: K,
    value: NewEmployee[K],
  ) => {
    setEmployee({ ...employee, [field]: value })
  }

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setEmployee({
          ...employee,
          licensePhotoFile: file,
          licensePreviewUrl: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    } else {
      setEmployee({
        ...employee,
        licensePhotoFile: null,
        licensePreviewUrl: null,
      })
    }
  }

  const validateEmployee = () => {
    if (!employee.userId.trim()) {
      showDialog({
        type: 'warning',
        title: '입력 필요',
        description: '사번은 필수입니다.',
        confirmText: '확인',
      })
      return false
    }
    if (!employee.name.trim()) {
      showDialog({
        type: 'warning',
        title: '입력 필요',
        description: '이름은 필수입니다.',
        confirmText: '확인',
      })
      return false
    }

    return true
  }

  // TODO: 리팩토링 필요
  const handleSubmit = async () => {
    if (!validateEmployee()) {
      return
    }

    setIsSubmitting(true)
    try {
      // 1단계: 기본 정보로 사용자 생성 (API는 여러건 처리 가능하도록 배열로 전송)
      const usersData = [
        {
          userId: employee.userId.trim(),
          name: employee.name.trim(),
          hireDate: employee.hireDate ? format(employee.hireDate, 'yyyy-MM-dd') : null,
          role: employee.role,
        },
      ]

      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(usersData),
      })

      const createResult = await createResponse.json()
      if (!createResult.success) {
        showDialog({
          type: 'error',
          title: '등록 실패',
          description: createResult.error || '사용자 등록에 실패했습니다.',
          confirmText: '확인',
        })
        return
      }

      // 존재하는 사번 + 활성화된 상태 : 등록 불가
      if (createResult.data.skipped.alreadyActive.length > 0) {
        const alreadyActiveUserIds = createResult.data.skipped.alreadyActive.join(', ')
        showDialog({
          type: 'error',
          title: '등록 실패',
          description: `${alreadyActiveUserIds}는 이미 존재하는 사번입니다.`,
          confirmText: '확인',
        })
        return
      }

      // 2단계: 생성된 사용자 ID로 면허증 업로드
      if (employee.licensePhotoFile && createResult.data && createResult.data.data.length > 0) {
        const createdUser = createResult.data.data[0]
        const formData = new FormData()
        formData.append('file', employee.licensePhotoFile)

        try {
          await uploadLicenseApi(createdUser.id, formData)
        } catch (e) {
          console.error('면허증 등록 실패', e)
        }
      }

      // 존재하는 사번 + 비활성화된 상태 : 등록 가능
      if (createResult.data.reactivatedCount > 0) {
        showDialog({
          type: 'success',
          title: '복구 완료',
          description: `${employee.userId} 사번은 비활성화 된 사용자입니다.\n복구 후 최신 정보로 갱신되었습니다.`,
          confirmText: '확인',
          onConfirm: () => {
            router.replace(ROUTES.ADMIN.USERS)
          },
        })
      } else {
        showDialog({
          type: 'success',
          title: '등록 완료',
          description: '신규 직원 등록이 완료되었습니다.',
          confirmText: '확인',
          onConfirm: () => {
            router.replace(ROUTES.ADMIN.USERS)
          },
        })
      }
    } catch (error) {
      console.error('직원 등록 실패:', error)
      showDialog({
        type: 'error',
        title: '등록 실패',
        description: '직원 등록에 실패했습니다.',
        confirmText: '확인',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  신규 직원 등록
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExcelDialogOpen(true)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  엑셀로 일괄 등록
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 공정면허증 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">공정면허증</label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                        className="hidden"
                        id="license-file"
                      />
                      <label
                        htmlFor="license-file"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        파일 선택
                      </label>
                      {employee.licensePhotoFile && (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleFileUpload(null)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          삭제
                        </Button>
                      )}
                    </div>
                    {employee.licensePhotoFile && (
                      <span className="text-sm text-gray-600 block">
                        {employee.licensePhotoFile.name}
                      </span>
                    )}
                    {employee.licensePreviewUrl ? (
                      <div className="w-full max-w-sm h-50 py-4 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={employee.licensePreviewUrl}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">사번 *</label>
                    <Input
                      value={employee.userId}
                      onChange={(e) => updateEmployee('userId', e.target.value)}
                      placeholder="사번을 입력하세요"
                      className="h-12 md:text-lg bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                    <Input
                      value={employee.name}
                      onChange={(e) => updateEmployee('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="h-12 md:text-lg bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* 입사일 */}
                  <div>
                    <CustomDatePicker
                      label={'입사일'}
                      date={employee.hireDate}
                      onChangeAction={(e) => {
                        updateEmployee('hireDate', e)
                      }}
                      className="!h-12 !text-lg bg-white border-gray-300 "
                    />
                  </div>

                  {/* 역할 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">역할 *</label>
                    <Select
                      value={employee.role}
                      onValueChange={(value: Role) => updateEmployee('role', value)}
                    >
                      <SelectTrigger className="w-full py-6 text-lg bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WORKER">
                          <div className="flex items-center text-lg ">작업자</div>
                        </SelectItem>
                        <SelectItem value="MANAGER">
                          <div className="flex items-center text-lg ">작업반장</div>
                        </SelectItem>
                        {currentUserRole === 'ADMIN' && (
                          <SelectItem value="ADMIN">
                            <div className="flex items-center text-lg ">관리자</div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
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
              {isSubmitting ? '등록 중...' : '등록'}
            </Button>
          </div>
        </div>
      </main>

      {/* 엑셀 업로드 다이얼로그 */}
      <ExcelUploadDialog
        open={isExcelDialogOpen}
        onOpenChange={setIsExcelDialogOpen}
        onUploadSuccess={() => router.push(ROUTES.ADMIN.USERS)}
      />
    </div>
  )
}

export default NewUsersPage
