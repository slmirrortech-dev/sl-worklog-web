import React from 'react'
import SubHeader from '@/components/worker/SubHeader'
import QueryProvider from '@/contexts/QueryProvider'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <div className="min-h-screen flex justify-center">
        <div className="w-full max-w-sm border">
          <SubHeader />
          {children}
        </div>
      </div>
    </QueryProvider>
  )
}

export default Layout
