'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { apiFetch } from '@/lib/api/api-fetch'

/** 면허증 이미지 모달 */
const ModalLicense = ({
  userName,
  setIsOpen,
  previewUrl,
  licensePhotoUrl,
}: {
  userName: string
  setIsOpen: any
  previewUrl: string | null
  licensePhotoUrl: string | null
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  // 새로고침/최초 진입 시 signedUrl 발급
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (licensePhotoUrl) {
        const { url }: any = await apiFetch(`/api/storage/signed-url?key=${licensePhotoUrl}`, {
          cache: 'force-cache',
        })
        if (url) setSignedUrl(url)
      }
    }
    fetchSignedUrl().then()
  }, [licensePhotoUrl])

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] min-h-[545px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{userName}님의 공정면허증</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex items-center justify-center min-h-full w-full">
          {previewUrl ? (
            <img src={previewUrl} alt="uploaded" />
          ) : signedUrl ? (
            <img src={signedUrl} alt="uploaded" />
          ) : (
            <p className="text-gray-400">이미지가 없습니다</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalLicense
