import React, { useEffect, useState } from 'react'
import { ApiResponse } from '@/types/common'
import { getLicenseApi } from '@/lib/api/user-api'
import { ImageOff } from 'lucide-react'

const CardLicense = ({ licensePhotoUrl }: { licensePhotoUrl: string | null }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  const fetchSignedUrl = async () => {
    if (!licensePhotoUrl) return

    setIsLoading(true)
    try {
      const { data }: ApiResponse<{ url: string }> = await getLicenseApi(licensePhotoUrl)
      if (data.url) setSignedUrl(data.url)
    } catch (e) {
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSignedUrl().then()
  }, [licensePhotoUrl])

  return (
    <div className="w-full" style={{ aspectRatio: '286/179' }}>
      {isLoading ? (
        <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse flex items-center justify-center"></div>
      ) : (
        <>
          {signedUrl ? (
            <img className="w-full h-full object-cover rounded-lg" src={signedUrl} alt="면허증" />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
              <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">등록된 면허증 없음</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CardLicense
