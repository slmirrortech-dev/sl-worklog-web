'use client'

import React, { useState } from 'react'
import { Eye, FileImage, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useLicenseUploader from '@/app/hooks/useLicenseUploader'
import LicenseModal from '@/components/admin/LicenseModal'

const LicenseBox = ({
  id,
  licensePhoto,
  onUploadComplete,
}: {
  id: string
  licensePhoto: string | null
  onUploadComplete?: () => void
}) => {
  const {
    inputRef,
    loading,
    loadingStep,
    onChange,
    licenseUrl,
    imageLoading,
    imageError,
    retryFetchUrl,
  } = useLicenseUploader(id, licensePhoto, onUploadComplete)
  const [showImageModal, setShowImageModal] = useState<boolean>(false)

  const handleLicenseDelete = async () => {
    if (!confirm('면허증을 삭제하시겠습니까?')) return
    try {
      const response = await fetch(`/api/users/${id}/license-photo`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const responseData = await response.json()

      if (responseData.success) {
        onUploadComplete?.()
      } else {
        alert(responseData.error || '면허증 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('면허증 삭제 실패:', error)
      alert('면허증 삭제에 실패했습니다.')
    }
  }

  return (
    <>
      <div className="space-y-4">
        {licensePhoto ? (
          <div className="relative group w-full max-w-sm h-50 p-4 rounded-lg overflow-hidden border border-gray-300">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                이미지 로딩 중…
              </div>
            ) : imageError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <FileImage className="w-8 h-8" />
                <div className="text-sm">이미지를 불러올 수 없습니다</div>
                <Button size="sm" variant="outline" onClick={retryFetchUrl} className="text-xs">
                  다시 시도
                </Button>
              </div>
            ) : licenseUrl ? (
              <>
                <div className="relative w-full h-full">
                  <img
                    src={licenseUrl}
                    alt="공정면허증"
                    className="w-full h-full object-contain transition-opacity duration-300"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 text-white"
                    onClick={() => handleLicenseDelete()}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white text-gray-800 hover:bg-gray-100"
                    onClick={() => setShowImageModal(true)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    확대보기
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                면허증 이미지가 없습니다.
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-sm h-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ">
            <div className="text-center text-gray-400">
              <FileImage className="w-8 h-8 mx-auto mb-6" />
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => onChange(e)}
                className="hidden"
                id="license-upload"
              />
              <label
                htmlFor="license-upload"
                className={`inline-flex flex-col items-center gap-1 px-3 py-1.5 border rounded-lg text-sm cursor-pointer ${
                  loading
                    ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
                    : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <FileImage className="w-4 h-4" />
                  {loading ? '업로드 중...' : '업로드'}
                </div>
                {loading && loadingStep && (
                  <div className="text-xs text-gray-400 mt-1 animate-pulse">{loadingStep}</div>
                )}
              </label>
            </div>
          </div>
        )}
      </div>
      {/* 이미지 모달 */}
      {showImageModal && licenseUrl && (
        <LicenseModal licenseUrl={licenseUrl} setShowImageModal={setShowImageModal} />
      )}
    </>
  )
}

export default LicenseBox
