'use client'

import React from 'react'
import ClassSettingCard from './_component/ClassSettingCard'
import ProcessSettingCard from './_component/ProcessSettingCard'

const WorkplaceSettingPage = () => {
  return (
    <div className="flex flex-col space-y-8 pb-8">
      {/* 설정 카드들 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start lg:grid-rows-1">
        <div className="h-[400px]">
          <ClassSettingCard />
        </div>
        <div className="h-[400px]">
          <ProcessSettingCard />
        </div>
      </section>
    </div>
  )
}

export default WorkplaceSettingPage
