import React from 'react'
import QueryProvider from '@/contexts/QueryProvider'
import { ToastProvider } from '@/contexts/ToastContext'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  )
}

export default Layout
