'use client'

import React, { useState } from 'react'
import { PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search, Loader2 } from 'lucide-react'
import RoleLabel from '@/components/admin/RoleLabel'
import { getUsersApi } from '@/lib/api/user-api'
import { UserResponseDto } from '@/types/user'
import { addWaitingWorKerApi } from '@/lib/api/wating-worker-api'
import { ProcessResponseDto } from '@/types/line-with-process'
import { ShiftType } from '@prisma/client'

/** 직원 추가 팝오버 */
const PopoverContentAdd = ({
  setLineWithProcess,
  setIsOpen,
  process,
  shiftType,
}: {
  setLineWithProcess: any
  setIsOpen: any
  process: ProcessResponseDto
  shiftType: ShiftType
}) => {
  const [searchText, setSearchText] = useState('')
  const [searchUsers, setSearchUsers] = useState<UserResponseDto[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  return (
    <PopoverContent className="w-80">
      <div className="space-y-4">
        <p className="text-base font-semibold">작업자를 선택하세요</p>
        <div className="flex items-center gap-2">
          <Input
            id="search-input"
            placeholder="사번 또는 이름으로 검색"
            value={searchText ?? ''}
            onChange={(event) => {
              const value = event.target.value
              setSearchText?.(value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                // onSearch?.()
              }
            }}
            className="w-full md:max-w-xs md:text-base h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            variant="outline"
            size="default"
            onClick={async () => {
              {
                setIsLoading(true)
                setIsError(false)
                setSearchUsers([])
                try {
                  const { data } = await getUsersApi(1, 100, searchText)
                  if (data.length === 0) {
                    setIsError(true)
                  } else {
                    setSearchUsers(data)
                  }
                } catch (e) {
                  setIsError(true)
                } finally {
                  setIsLoading(false)
                }
              }
            }}
            disabled={isLoading}
            className="px-3 h-10"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="max-h-60 overflow-y-scroll">
          <ul>
            {searchUsers.length > 0 ? (
              <>
                {searchUsers.map((user) => {
                  return (
                    <li className="border-b" key={user.id}>
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await addWaitingWorKerApi(
                              process.id,
                              shiftType,
                              user.id,
                            )
                            setLineWithProcess(data.updated)
                            setIsOpen(true)
                          } catch (e) {
                            alert(e)
                          }
                        }}
                        className="flex justify-between items-center w-full flex-row gap-2 hover:bg-gray-100 px-2 py-4 transition-all"
                      >
                        <div className="flex flex-row gap-2">
                          <RoleLabel role={user.role} size={'sm'} />
                          <span className="font-semibold">{user.name}</span>
                          <span className="text-gray-500">({user.userId})</span>
                        </div>
                        <Plus className="w-4 h-4" />
                      </button>
                    </li>
                  )
                })}
              </>
            ) : (
              <div className="flex flex-col justify-center items-center py-12">
                {isError && <p className="text-sm text-gray-400">검색된 작업자가 없습니다.</p>}
                {isLoading && (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-500">검색 중...</p>
                  </div>
                )}
              </div>
            )}
          </ul>
        </div>
      </div>
    </PopoverContent>
  )
}

export default PopoverContentAdd
