import React from 'react'
import { LockInfo } from '@/hooks/useEditLock'

/** 편집 중 안내 화면 */
const ModalEditLock = ({
  lockInfo,
  handleCancelEdit,
}: {
  lockInfo: LockInfo
  handleCancelEdit: any
}) => {
  // 본인이 편집 중일 때
  if (lockInfo.isEditMode) {
    return (
      <div className="fixed bottom-10 left-0 right-0 z-50">
        <div className="flex items-center justify-center h-full">
          <div className="bg-white rounded-full shadow-xl border border-yellow-200 py-3 px-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="text-lg text-yellow-600">⚠️</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="sm:text-xs md:text-lg text-black text-center">
                    편집 모드를 해제하면 변경사항이 자동 저장됩니다.
                  </p>
                  {handleCancelEdit && (
                    <button
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors"
                      onClick={handleCancelEdit}
                    >
                      편집취소
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 다른사람이 편집 중 일 때
  if (lockInfo.isLocked) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 bg-black/40">
        <div className="flex items-center justify-center h-full">
          <div className="bg-white rounded-lg shadow-xl border border-yellow-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <div className="text-3xl text-yellow-600">🔒</div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {lockInfo?.lockedByUser}님 편집 중
                </h3>
                <p className="text-base text-gray-600 mt-1">작업장 관리가 일시적으로 제한됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default ModalEditLock
