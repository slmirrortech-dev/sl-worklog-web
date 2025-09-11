'use client'

import React, { useEffect, useState } from 'react'
import { LineResponseDto } from '@/types/line-with-process'
import { GripVertical, Plus, X } from 'lucide-react'

const SettingProcess = ({ initialData }: { initialData: LineResponseDto[] }) => {
  const [lineWithProcess, setLineWithProcess] = useState<LineResponseDto[]>(initialData)

  useEffect(() => {
    console.log(lineWithProcess)
  }, [lineWithProcess])

  const leftTableHead = `min-w-[160px] min-h-[58px]`
  const leftTableShiftHead = `min-w-[160px] min-h-[90px]`

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
      <div className="overflow-auto max-h-screen">
        {/* 테이블 */}
        <table className="w-full border-collapse">
          {/* 테이블 해더 */}
          <thead>
            <tr>
              <th
                // colSpan={2}
                className="w-40 border-b border-gray-300 p-2 bg-gray-200 text-sm font-semibold text-gray-700 sticky left-0 top-0 z-20"
              >
                라인
              </th>
              <th className="border-b border-gray-300 p-2 bg-gray-200 text-sm font-semibold text-gray-700 sticky top-0 z-10">
                공정
              </th>
            </tr>
          </thead>
          {/* 테이블 바디 */}
          <tbody>
            {lineWithProcess.map((line) => {
              return (
                <React.Fragment key={line.id}>
                  <tr>
                    <td className="sticky left-0 z-10">
                      <div
                        className={`flex items-center justify-between ${leftTableHead} px-2 bg-green-100 text-green-900 cursor-move`}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-lg font-bold">{line.name} </span>
                      </div>
                    </td>
                    <td className="flex">
                      {/* 라인의 하위 공정 목록 */}
                      {line.processes.map((process) => {
                        return (
                          <div key={process.id} className={`${leftTableHead} px-2 py-1`}>
                            <div className="bg-green-200 px-2 border rounded-sm flex h-full items-center justify-center gap-1 cursor-move">
                              <GripVertical className="w-6 h-6 text-gray-400" />
                              <span className="block w-full text-green-800 font-bold">
                                {process.name}
                              </span>
                              <button
                                title="공정 삭제"
                                className="group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-10">
                      <div
                        className={`flex items-center justify-between  ${leftTableShiftHead} px-2 py-1 bg-gray-50`}
                      >
                        <div
                          className={`border border-orange-200 bg-orange-100 px-4 py-1 rounded-2xl`}
                        >
                          <span className="font-semibold text-base">주간</span>
                        </div>
                        <span>정상</span>
                      </div>
                    </td>
                    {/* 주간 공정 작업자 리스트 */}
                    <td className="flex">
                      {line.processes.map((process, index) => {
                        const waitingWorker = process.shifts.filter(
                          ({ type }) => type === 'DAY',
                        )?.[0]?.waitingWorker

                        const isWaitingWorker = !!waitingWorker

                        return (
                          <div key={process.id} className={`${leftTableShiftHead} px-2 py-1`}>
                            <div className="bg-gray-50 border border-gray-200 rounded-sm flex h-full items-center justify-center gap-1 cursor-move">
                              {isWaitingWorker ? (
                                <span>{waitingWorker?.name}</span>
                              ) : (
                                <span className="text-xs text-gray-400">대기</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-10">
                      <div
                        className={`flex items-center justify-between  ${leftTableShiftHead} px-2 bg-gray-50`}
                      >
                        <div
                          className={`border border-purple-300 bg-purple-100 px-4 py-1 rounded-2xl`}
                        >
                          <span className="font-semibold text-base">야간</span>
                        </div>
                        <span>잔업</span>
                      </div>
                    </td>
                    {/* 야간 공정 작업자 리스트 */}
                    <td className="flex">
                      {line.processes.map((process, index) => {
                        const waitingWorker = process.shifts.filter(
                          ({ type }) => type === 'NIGHT',
                        )?.[0]?.waitingWorker

                        const isWaitingWorker = !!waitingWorker

                        return (
                          <div key={process.id} className={`${leftTableShiftHead} px-2 py-1`}>
                            <div className="bg-gray-50 border border-gray-200 rounded-sm flex h-full items-center justify-center gap-1 cursor-move">
                              {isWaitingWorker ? (
                                <span>{waitingWorker?.name}</span>
                              ) : (
                                <span className="text-xs text-gray-400">대기</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
            <tr>
              <td className="py-2">
                <button className="m-auto flex justify-center items-center w-12 h-12 bg-blue-500 rounded-full text-white">
                  <Plus />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SettingProcess
