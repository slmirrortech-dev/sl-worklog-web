'use client'

import React, { useEffect, useState } from 'react'
import { IdCardIcon, Upload } from 'lucide-react'
import { UserResponseDto } from '@/types/user'
import { getLicenseApi, uploadLicenseApi } from '@/lib/api/user-api'
import { ApiResponse } from '@/types/common'

/**
 * 이미지 업로드/모달 보기 컴포넌트
 * 그리드 전용
 */
export default function BoxLicense({ targetUser }: { targetUser: UserResponseDto }) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  // 새로고침/최초 진입 시 signedUrl 발급
  useEffect(() => {
    if (!targetUser.licensePhotoUrl) return
    ;(async () => {
      const { data }: ApiResponse<{ url: string }> = await getLicenseApi(
        targetUser.licensePhotoUrl as string,
      )

      if (data.url) setSignedUrl(data.url)
    })()
  }, [targetUser.licensePhotoUrl])

  const fetchUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const { data }: ApiResponse<{ url: string }> = await uploadLicenseApi(targetUser.id, formData)

    if (data.url) {
      // signed URL
      setPreviewUrl(data.url)
    }
  }

  useEffect(() => {
    if (!file) return
    fetchUpload(file).then()
  }, [file])

  return (
    <div>
      {previewUrl || signedUrl ? (
        <>
          {previewUrl ? (
            <img className="w-full" src={previewUrl} alt="uploaded" />
          ) : signedUrl ? (
            <img className="w-full" src={signedUrl} alt="uploaded" />
          ) : (
            <p className="text-gray-400">이미지가 없습니다</p>
          )}
        </>
      ) : (
        <div className="flex flex-col justify-center items-center border-2 rounded-lg border-dashed bg-gray-50/50 min-h-56">
          <IdCardIcon className="w-12 h-12 inline text-gray-400 mb-6" />
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
        </div>
      )}
    </div>
  )
}
