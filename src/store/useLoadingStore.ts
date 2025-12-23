import { create } from 'zustand'

interface LoadingStore {
  isLoading: boolean
  showLoading: () => void
  hideLoading: () => void
}

const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  showLoading: () => set({ isLoading: true }),
  hideLoading: () => set({ isLoading: false }),
}))

export default useLoadingStore
