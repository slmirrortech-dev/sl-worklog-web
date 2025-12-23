import { create } from 'zustand'

export type DialogType = 'success' | 'warning' | 'error'

export interface DialogState {
  isOpen: boolean
  type: DialogType
  title: string
  description: string
  showCancel: boolean
  cancelText: string
  confirmText: string
  onCancel?: () => void
  onConfirm?: () => void
  isLoading: boolean
}

interface DialogStore extends DialogState {
  showDialog: (options: {
    type: DialogType
    title: string
    description: string
    showCancel?: boolean
    cancelText?: string
    confirmText?: string
    onCancel?: () => void
    onConfirm?: () => void
  }) => void
  hideDialog: () => void
  setLoading: (loading: boolean) => void
}

const useDialogStore = create<DialogStore>((set) => ({
  // 초기 상태
  isOpen: false,
  type: 'success',
  title: '',
  description: '',
  showCancel: false,
  cancelText: '취소',
  confirmText: '확인',
  onCancel: undefined,
  onConfirm: undefined,
  isLoading: false,

  // Dialog 표시
  showDialog: (options) =>
    set({
      isOpen: true,
      type: options.type,
      title: options.title,
      description: options.description,
      showCancel: options.showCancel ?? false,
      cancelText: options.cancelText ?? '취소',
      confirmText: options.confirmText ?? '확인',
      onCancel: options.onCancel,
      onConfirm: options.onConfirm,
      isLoading: false,
    }),

  // Dialog 숨기기
  hideDialog: () =>
    set({
      isOpen: false,
      isLoading: false,
    }),

  // 로딩 상태 변경
  setLoading: (loading) => set({ isLoading: loading }),
}))

export default useDialogStore
