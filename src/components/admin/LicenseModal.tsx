import React from 'react'
import { X, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LicenseModal = ({
  licenseUrl,
  setShowImageModal,
  imageLoading = false,
  imageError = false,
  onRetry,
  userName,
}: {
  licenseUrl: string | null
  setShowImageModal: (value: boolean) => void
  imageLoading?: boolean
  imageError?: boolean
  onRetry?: () => void
  userName?: string
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={() => setShowImageModal(false)}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] min-h-[500px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        {userName && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {userName}님의 공정면허증
            </h3>
            <button
              onClick={() => setShowImageModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* 모달 내용 */}
        <div className="p-6 flex items-center justify-center min-h-96 w-full">
          {imageLoading ? (
            <div className="flex items-center justify-center text-gray-400">
              이미지 로딩 중...
            </div>
          ) : imageError ? (
            <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
              <FileImage className="w-12 h-12" />
              <div>이미지를 불러올 수 없습니다</div>
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="text-xs"
                >
                  다시 시도
                </Button>
              )}
            </div>
          ) : licenseUrl ? (
            <>
              <img
                src={licenseUrl}
                alt={`${userName || ''}님의 공정면허증`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
              {!userName && (
                <Button
                  size="sm"
                  onClick={() => setShowImageModal(false)}
                  className="absolute top-2 right-2 bg-white text-gray-800 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center text-gray-400">
              면허증 이미지가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LicenseModal
