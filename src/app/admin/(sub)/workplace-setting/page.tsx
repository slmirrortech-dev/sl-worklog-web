'use client'

import React from 'react'
import ClassSettingCard from './_component/ClassSettingCard'
import ProcessSettingCard from './_component/ProcessSettingCard'
import LineSettingCard from './_component/LineSettingCard'

const WorkplaceSettingPage = () => {
  return (
    <div className="flex flex-col space-y-6 pb-8">
      {/* 반 & 공정 설정 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="h-[400px]">
          <ClassSettingCard />
        </div>
        <div className="h-[400px]">
          <ProcessSettingCard />
        </div>
      </section>

      {/* 라인 & 린지원 설정 */}
      <section className="grid grid-cols-1 lg:grid-cols-1 gap-6 items-start">
        <div className="h-[700px]">
          <LineSettingCard />
        </div>
      </section>
    </div>
  )
}

export default WorkplaceSettingPage
