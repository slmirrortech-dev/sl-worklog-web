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
  const [showModal, setShowModal] = useState(false)

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
            {selectedProcess.shifts.map((shift: any) => {
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
                onClick={() => setShowModal(false)}
                className="flex-1  text-primary-900 border-1 border-primary-900 py-4 px-6 text-xl font-medium rounded-xl"
              >
                취소
              </button>
              <button className="flex-1 bg-primary-900 text-white py-4 px-6 text-xl font-medium rounded-xl">
                시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Lines
