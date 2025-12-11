'use client'

import React, { useEffect, useState } from 'react'
import { IdCardIcon, Upload, ZoomIn, Trash2 } from 'lucide-react'
import { UserResponseDto } from '@/types/user'
import { deleteLicenseApi, getLicenseApi, uploadLicenseApi } from '@/lib/api/user-api'
import { ApiResponse } from '@/types/common'
import ModalLicense from '@/components/admin/ModalLicense'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

/**
 * 이미지 업로드/모달 보기 컴포넌트
 * 그리드 전용
 */
export default function BoxLicense({
  targetUser,
  setFreshUser,
  canEdit,
}: {
  targetUser: UserResponseDto
  setFreshUser: any
  canEdit: boolean
}) {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  // 새로고침/최초 진입 시 signedUrl 발급
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!targetUser.licensePhotoUrl) return

      setIsLoading(true)
      const { data }: ApiResponse<{ url: string }> = await getLicenseApi(targetUser.licensePhotoUrl)
      if (data.url) setSignedUrl(data.url)
    }
    fetchSignedUrl()
      .then()
      .finally(() => {
        setIsLoading(false)
      })
  }, [targetUser.licensePhotoUrl])

  const fetchUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    showLoading()
    try {
      const { data }: ApiResponse<{ url: string }> = await uploadLicenseApi(targetUser.id, formData)

      if (data.url) {
        // signed URL
        setPreviewUrl(data.url)
        router.refresh()
      }
    } catch {
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      hideLoading()
    }
  }

  useEffect(() => {
    if (!file) return

    fetchUpload(file).then()
  }, [file])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-full h-56 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {previewUrl || signedUrl ? (
        <>
          {previewUrl ? (
            <img className="w-full" src={previewUrl} alt="uploaded" />
          ) : signedUrl ? (
            <img className="w-full" src={signedUrl} alt="uploaded" />
          ) : (
            <p className="text-gray-400">이미지가 없습니다</p>
          )}
          <div className="absolute left-0 top-0 w-full h-full bg-black/30 opacity-0 hover:opacity-100 transition-all flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setIsOpenModal(true)
              }}
              className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
            >
              <ZoomIn className="w-4 h-4" />
              확대
            </button>
            {canEdit && (
              <button
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    const { data } = await deleteLicenseApi(targetUser.id)
                    setPreviewUrl(null)
                    setSignedUrl(null)
                    setFreshUser(data)
                    router.refresh()
                  } catch (error) {
                    console.error(error)
                    alert('면허증 이미지 삭제 실패했습니다.')
                  } finally {
                    setIsLoading(false)
                  }
                }}
                className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            )}
          </div>
          {isOpenModal && (
            <ModalLicense
              userName={targetUser.name}
              setIsOpen={setIsOpenModal}
              previewUrl={previewUrl || signedUrl}
              licensePhotoUrl={null}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col justify-center items-center border-2 rounded-lg border-dashed bg-gray-50/50 min-h-56">
          <IdCardIcon className="w-12 h-12 inline text-gray-400 mb-6" />
          {canEdit ? (
            <>
              <label
                htmlFor="inputFile"
                className="inline-flex justify-center items-center border rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 text-sm  transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                업로드
              </label>
              <input
                id="inputFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0])
                  }
                }}
                style={{
                  display: 'none',
                }}
              />
              <div className="text-xs text-gray-500 mt-4">
                * 5MB 이하의 이미지 파일만 업로드 가능합니다.
              </div>
            </>
          ) : (
            <>등록된 면허증이 없습니다.</>
          )}
        </div>
      )}
    </div>
  )
}
