import React from 'react'
import QueryProvider from '@/app/admin/(main)/_components/QueryProvider'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <QueryProvider>{children}</QueryProvider>
}

export default Layout
