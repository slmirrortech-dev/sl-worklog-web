import React from 'react'
import SubHeader from '@/components/worker/SubHeader'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-sm border">
        <SubHeader />
        {children}
      </div>
    </div>
  )
}

export default Layout
