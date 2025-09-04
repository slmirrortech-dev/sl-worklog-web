'use client'

import React, { useEffect, useState } from 'react'
import { Eye, FileImage, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useLicenseUploader from '@/app/hooks/useLicenseUploader'

const LicenseBox = ({
  id,
  licensePhoto,
  onUploadComplete,
}: {
  id: string
  licensePhoto: string | null
  onUploadComplete?: () => void
}) => {
  const { inputRef, loading, onChange, updatedLicense } = useLicenseUploader(onUploadComplete)
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState<boolean>(false)

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await fetch(`/api/users/${id}/license-photo/url`, {
          credentials: 'include',
          cache: 'force-cache',
          next: { revalidate: 60 * 30 } // 30분 캐시
        })
        const { url } = await res.json()
        setLicenseUrl(url ?? null)
      } catch {
        setLicenseUrl(null)
      }
    }
    fetchUrl()
  }, [id, licensePhoto, updatedLicense])

  const handleLicenseDelete = async () => {
    if (!confirm('면허증을 삭제하시겠습니까?')) return
    try {
      const response = await fetch(`/api/users/${id}/license-photo`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const responseData = await response.json()

      if (responseData.success) {
        setLicenseUrl(null)
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
          <div className="relative group w-full max-w-sm h-50 p-4 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
            {licenseUrl ? (
              <img src={licenseUrl} alt="공정면허증" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                이미지 로딩 중…
              </div>
            )}

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
          </div>
        ) : (
          <div className="w-full max-w-sm h-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-400">
              <FileImage className="w-8 h-8 mx-auto mb-6" />
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => onChange(e, id)}
                className="hidden"
                id="license-upload"
              />
              <label
                htmlFor="license-upload"
                className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm cursor-pointer ${
                  loading
                    ? 'border-gray-300 text-gray-500 bg-gray-50 cursor-not-allowed'
                    : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                }`}
              >
                <FileImage className="w-4 h-4" />
                {loading ? '업로드 중...' : '업로드'}
              </label>
            </div>
          </div>
        )}
      </div>
      {/* 이미지 모달 */}
      {showImageModal && licenseUrl && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            {licenseUrl ? (
              <img
                src={licenseUrl}
                alt="공정면허증 확대보기"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-white">이미지 로딩 중…</div>
            )}
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
    </>
  )
}

export default LicenseBox
