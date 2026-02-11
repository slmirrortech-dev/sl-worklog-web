import React from 'react'
import { ToastProvider } from '@/contexts/ToastContext'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ToastProvider>{children}</ToastProvider>
}

export default Layout