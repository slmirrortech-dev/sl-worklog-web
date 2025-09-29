import React from 'react'
import HomeHeader from '@/app/worker/home/_component/HomeHeader'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-sm border">
        <HomeHeader />
        {children}
      </div>
    </main>
  )
}

export default HomeLayout
