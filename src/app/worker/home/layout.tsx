import React from 'react'
import HomeHeader from '@/app/worker/home/_component/HomeHeader'

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen bg-white">
      <HomeHeader />
      {children}
    </main>
  )
}

export default HomeLayout
