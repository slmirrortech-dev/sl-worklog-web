'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from '@/components/ui/drawer'
import { Line, Process, ProcessShift } from '@prisma/client'
import { ChevronDown } from 'lucide-react'
import { addWorkLogApi } from '@/lib/api/work-log-api'
import CustomAlertDialog from '@/components/CustomAlertDialog'
import { addWorkLogResponseModel } from '@/types/work-log'
import { ApiErrorResponse } from '@/types/common'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

type ComboBoxOption = {
  id: string
  name: string
}

function StatusList({
  options,
  setOpen,
  setSelectedStatus,
  selectedStatus,
}: {
  options: ComboBoxOption[]
  setOpen: (open: boolean) => void
  setSelectedStatus: (option: any | null) => void
  selectedStatus: ComboBoxOption | null
}) {
  return (
    <Command value={selectedStatus?.name || ''} defaultValue="" shouldFilter={true}>
      <CommandInput placeholder="라인을 입력하세요." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.id}
              value={option.name}
              onSelect={() => {
                setSelectedStatus(option)
                setOpen(false)
              }}
              className={`hover:bg-transparent data-[selected=true]:bg-transparent ${selectedStatus?.id === option.id ? '!bg-accent !text-accent-foreground' : ''}`}
            >
              <span className="font-normal">
                {option.name.split(':')[0]}
                <span className="text-lg font-normal text-gray-500 ml-2">
                  {option.name.split(':')[1]}반
                </span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

const Lines = ({ lines }: { lines: any }) => {
  const router = useRouter()
  const [isOpenAlert, setIsOpenAlert] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [errorCallback, setErrorCallback] = useState<() => void>(() => () => {})

  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [selectedLine, setSelectedLine] = useState<ComboBoxOption | null>(null)
  const [selectedProcess, setSelectedProcess] = useState<any | null>(null)
  const [finalSelectedProcess, setFinalSelectedProcess] = useState<any | null>(null)

  const lineOptions: ComboBoxOption[] = useMemo(() => {
    return lines.map((line: Line) => {
      return {
        id: line.id,
        name: `${line.name}:${line.classNo}`,
      }
    })
  }, [lines])

  const processOptions: any[] = useMemo(() => {
    setSelectedProcess(null)
    setFinalSelectedProcess(null)
    if (selectedLine === null) return []
    return lines
      .filter((line: Line) => line.id === selectedLine.id)[0]
      .processes.map((process: Process & { shifts: ProcessShift[] }) => {
        return {
          id: process.id,
          name: process.name,
          shifts: process.shifts,
        }
      })
  }, [selectedLine])

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">라인 선택</h2>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full justify-between text-xl py-8 rounded-sm">
                {selectedLine ? (
                  <>
                    <span className="font-medium">
                      {selectedLine.name.split(':')[0]}
                      <span className="text-xl font-normal text-gray-500 ml-2">
                        {selectedLine.name.split(':')[1]}반
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="font-normal text-gray-500">라인을 선택하세요</span>
                )}
                <ChevronDown className={`!w-6 !h-6 ${open ? 'rotate-180' : ''}`} />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerTitle className="sr-only">라인 선택</DrawerTitle>
              <div className="mt-4 border-t">
                <StatusList
                  options={lineOptions}
                  setOpen={setOpen}
                  setSelectedStatus={setSelectedLine}
                  selectedStatus={selectedLine}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {processOptions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">공정 선택</h2>
            <ul className="grid grid-cols-2 gap-3">
              {processOptions.map((process) => (
                <li key={process.id}>
                  <button
                    onClick={() => setSelectedProcess(process)}
                    className={`w-full px-2 py-3.5 rounded-xl text-lg font-medium transition-colors ${
                      selectedProcess && selectedProcess.id === process.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {process.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedProcess && (
          <div>
            <h2 className="text-lg font-semibold mb-2">시간대 선택</h2>
            <ul className="grid grid-cols-2 gap-3">
              {selectedProcess.shifts
                .sort((a: any, b: any) => {
                  if (a.type === 'DAY' && b.type === 'NIGHT') return -1
                  if (a.type === 'NIGHT' && b.type === 'DAY') return 1
                  return 0
                })
                .map((shift: any) => {
                  return (
                    <li key={shift.id}>
                      <button
                        onClick={() => setFinalSelectedProcess(shift)}
                        className={`w-full px-2 py-3.5 rounded-xl text-lg font-medium transition-colors ${
                          finalSelectedProcess && finalSelectedProcess.id === shift.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {shift.type === 'DAY' ? '주간' : '야간'}
                      </button>
                    </li>
                  )
                })}
            </ul>
          </div>
        )}

        <div className="fixed left-0 bottom-0 right-0 flex">
          {finalSelectedProcess && (
            <button
              onClick={() => setShowModal(true)}
              className="flex-1/3 bg-primary-900 text-white border-t border-primary-900 py-4 px-6 text-2xl font-medium"
            >
              선택 완료
            </button>
          )}
        </div>
      </div>
      {/* 컨펌 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-950/75 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <p className="text-2xl font-bold text-center mb-2">작업 선택 확인</p>
            <p className="text-lg text-gray-600 text-center mb-6">작업을 시작하시겠습니까?</p>

            <div className="bg-gray-100 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-600">라인</span>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedLine?.name.split(':')[0]}
                    <span className="text-gray-500 ml-2">{selectedLine?.name.split(':')[1]}반</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-600">공정</span>
                  <span className="text-lg font-bold text-gray-900">{selectedProcess?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-600">시간대</span>
                  <span className="text-lg font-bold text-gray-900">
                    {finalSelectedProcess?.type === 'DAY' ? '주간' : '야간'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                disabled={isLoading}
                onClick={() => setShowModal(false)}
                className={`${isLoading && 'opacity-50'} flex-1 text-primary-900 border-1 border-primary-900 py-4 px-6 text-xl font-medium rounded-xl`}
              >
                취소
              </button>
              <button
                disabled={isLoading}
                className={`${isLoading && 'opacity-50'} flex-1 bg-primary-900 text-white py-4 px-6 text-xl font-medium rounded-xl`}
                onClick={async () => {
                  setIsLoading(true)
                  try {
                    await addWorkLogApi({
                      startedAt: new Date(),
                      processShiftId: finalSelectedProcess.id,
                    })
                    router.replace(ROUTES.WORKER.HOME)
                  } catch (error: unknown) {
                    const { code } = error as ApiErrorResponse
                    setIsOpenAlert(true)
                    setShowModal(false)

                    // 해당 작업장에 배정된 작업자가 없을 경우
                    if (code === 'NO_WAITING_WORKER_ASSIGNED') {
                      setErrorMsg(`선택한 작업장에 아직 작업자가 배정되지 않았습니다.`)
                    }
                    // 해당 작업장은 현재 사용자에게 배정되지 않은 경우
                    else if (code === 'NOT_ASSIGNED_TO_THIS_WORKSTATION') {
                      setErrorMsg(`해당 작업장은 다른 작업자에게 배정되어 있습니다.`)
                    }
                    // 작업장 자체가 없을 경우
                    else if (code === 'NOT_FOUND_PROCESS_SHIFT') {
                      setErrorMsg(
                        `해당 작업장이 존재하지 않습니다.\n관리자에게 문의하거나\n다시 시도해주세요.`,
                      )
                      setErrorCallback(() => () => {
                        router.back()
                      })
                    } else if (code === 'WORK_ALREADY_IN_PROGRESS') {
                      setErrorMsg(
                        `이미 진행 중인 작업이 있습니다.\n해당 작업 종료 후 다시 시작하세요.`,
                      )
                      setErrorCallback(() => () => {
                        router.back()
                      })
                    } else {
                      setErrorMsg(`오류가 발생했습니다.\n관리자에게 문의하거나\n다시 시도해주세요.`)
                      setErrorCallback(() => () => {
                        router.back()
                      })
                    }
                  } finally {
                    setIsLoading(false)
                  }
                }}
              >
                {isLoading ? '저장 중...' : '시작'}
              </button>
            </div>
          </div>
        </div>
      )}
      <CustomAlertDialog
        isOpen={isOpenAlert}
        setIsOpen={setIsOpenAlert}
        title="작업 시작 실패"
        desc={errorMsg}
        btnConfirm={{ fn: errorCallback }}
      />
    </>
  )
}

export default Lines
