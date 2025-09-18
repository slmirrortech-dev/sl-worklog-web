import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import React from 'react'
import { AlertTriangle } from 'lucide-react'

const CustomConfirmDialog = ({
  isOpen,
  setIsOpen,
  isLoading,
  title = '제목',
  desc = '제목',
  btnCancel = { btnText: '취소', fn: () => {} },
  btnConfirm = { btnText: '확인', fn: () => {} },
}: {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  isLoading: boolean
  title: string
  desc: string
  btnCancel?: { btnText?: string; fn?: () => void }
  btnConfirm?: { btnText?: string; fn?: () => void }
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-primary-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {desc.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < desc.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex !flex-row">
          <button
            disabled={isLoading}
            className={`${
              isLoading && 'opacity-50'
            } text-lg h-12 text-primary-900 border-1 border-primary-900 bg-white flex-1 rounded-md`}
            onClick={() => {
              btnCancel.fn && btnCancel.fn()
              setIsOpen(false)
            }}
          >
            {btnCancel.btnText}
          </button>

          {btnConfirm && (
            <button
              disabled={isLoading}
              className={`${
                isLoading && 'opacity-50'
              } text-lg h-12 bg-primary-900 flex-1 text-white rounded-md`}
              onClick={() => {
                btnConfirm.fn && btnConfirm.fn()
              }}
            >
              {isLoading ? '종료 중...' : btnConfirm.btnText}
            </button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CustomConfirmDialog
