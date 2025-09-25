'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ToastContextType {
  showToast: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; isVisible: boolean }>({
    message: '',
    isVisible: false,
  })
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null)

  const showToast = (message: string, duration: number = 2000) => {
    if (toastTimeout) {
      clearTimeout(toastTimeout)
    }

    setToast({ message, isVisible: true })

    const newTimeout = setTimeout(() => {
      setToast({ message: '', isVisible: false })
      setToastTimeout(null)
    }, duration)

    setToastTimeout(newTimeout)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-xl bg-black/70 text-white px-8 py-4 rounded-full shadow-lg animate-[slideUp_0.3s_ease-out_forwards]">
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
