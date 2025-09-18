import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import React from 'react'
import { AlertCircle } from 'lucide-react'

const CustomAlertDialog = ({
  isOpen,
  setIsOpen,
  title = '제목',
  desc = '제목',
  btnConfirm = { btnText: '확인', fn: () => {} },
}: {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  title: string
  desc: string
  btnConfirm?: { btnText?: string; fn?: any }
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
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
        {btnConfirm && (
          <AlertDialogFooter>
            <AlertDialogAction
              className={'text-lg h-12 bg-primary-900'}
              onClick={() => {
                setIsOpen(true)
                btnConfirm.fn && btnConfirm.fn()
              }}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CustomAlertDialog
