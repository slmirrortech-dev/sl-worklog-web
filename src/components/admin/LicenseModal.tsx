import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LicenseModal = ({
  licenseUrl,
  setShowImageModal,
}: {
  licenseUrl: string | null
  setShowImageModal: (value: boolean) => void
}) => {
  return (
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
  )
}

export default LicenseModal
