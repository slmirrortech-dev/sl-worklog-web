import React from 'react'
import prisma from '@/lib/core/prisma'
import { LineResponseDto } from '@/types/line-with-process'
import SettingProcess from '@/app/admin/(main)/setting-line/_component/SettingProcess'
import { getShiftStatus } from '@/lib/utils/line-status'

/** 작업장 현황판 */
const ProcessPage = async () => {
  let responseData: LineResponseDto[] = []

  try {
    const lines = await prisma.line.findMany({
      include: {
        processes: {
          include: {
            shifts: {
              include: {
                waitingWorker: {
                  select: { id: true, userId: true, name: true },
                },
              },
            },
          },
        },
      },
    })

    // 확장
    responseData = lines.map((line) => ({
      ...line,
      dayStatus: getShiftStatus(line.processes, 'DAY'),
      nightStatus: getShiftStatus(line.processes, 'NIGHT'),
    }))
  } catch (error) {
    console.error(error)
  }
  return (
    <div className="flex flex-col space-y-6 pb-10">
      {/*<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">*/}
      {/*  <div className="flex items-center justify-between">*/}
      {/*    <div>*/}
      {/*      <h1 className="text-2xl font-bold text-gray-900">작업장 관리</h1>*/}
      {/*      <p className="text-gray-600 mt-2">*/}
      {/*        라인과 공정을 드래그하여 순서를 변경하고, 클릭하여 편집할 수 있습니다.*/}
      {/*      </p>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <SettingProcess initialData={responseData} />
    </div>
  )
}

export default ProcessPage
