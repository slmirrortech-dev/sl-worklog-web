'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { FileImage, Plus } from 'lucide-react'
import ModalLicense from '@/components/admin/ModalLicense'
import { UserResponseDto } from '@/types/user'
import { uploadLicenseApi } from '@/lib/api/user-api'
import { ApiResponse } from '@/types/common'
import { useLoading } from '@/contexts/LoadingContext'

/**
 * 이미지 업로드/모달 보기 컴포넌트
 * 그리드 전용
 */
export default function ButtonLicense({
  targetUser,
  canEdit,
}: {
  targetUser: UserResponseDto
  canEdit: boolean
}) {
  const { showLoading, hideLoading } = useLoading()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const fetchUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data }: ApiResponse<{ url: string }> = await uploadLicenseApi(targetUser.id, formData)
      if (data.url) {
        // signed URL
        setPreviewUrl(data.url)
      }
    } catch (e) {
      console.error('면허증 등록 실패', e)
    }
  }

  useEffect(() => {
    if (!file) return
    showLoading()
    fetchUpload(file)
      .then()
      .finally(() => {
        hideLoading()
      })
  }, [file])

  return (
    <div>
      {previewUrl ? (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsModalOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
          >
            <FileImage className="w-3 h-3" />
            확인
          </Button>
        </>
      ) : targetUser.licensePhotoUrl ? (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsModalOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
          >
            <FileImage className="w-3 h-3" />
            확인
          </Button>
        </>
      ) : (
        <>
          {canEdit ? (
            <>
              <label
                htmlFor={`inputFile-${targetUser.id}`}
                className="inline-flex justify-center items-center border rounded-md  px-2 py-1.5 text-sm hover:bg-gray-100 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3 mr-1" />
                업로드
              </label>
              <input
                id={`inputFile-${targetUser.id}`}
                type="file"
                onChange={handleFileChange}
                style={{
                  display: 'none',
                }}
              />
            </>
          ) : (
            <>-</>
          )}
        </>
      )}
      {isModalOpen && (
        <ModalLicense
          userName={targetUser.name}
          setIsOpen={setIsModalOpen}
          previewUrl={previewUrl}
          licensePhotoUrl={targetUser.licensePhotoUrl}
        />
      )}
    </div>
  )
}
