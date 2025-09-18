import React from 'react'
import Lines from '@/app/worker/(sub)/start/_component/Lines'
import prisma from '@/lib/core/prisma'

const StartPage = async () => {
  const lines = await prisma.line.findMany({
    include: {
      processes: {
        orderBy: { order: 'asc' },
        include: {
          shifts: {},
        },
      },
    },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white px-4 py-6">
        <section className="mb-8">
          <h1 className="text-2xl font-bold">작업 시작하기</h1>
          <p className="text-base text-gray-500">배정 받은 작업을 선택해주세요.</p>
        </section>
        <Lines lines={lines} />
      </div>
    </div>
  )
}

export default StartPage
