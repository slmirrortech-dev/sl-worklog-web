'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getFactoryConfigApi, updateFactoryConfigApi } from '@/lib/api/workplace-api'
import { useLoading } from '@/contexts/LoadingContext'

interface ProcessItem {
  id: number
  name: string
  order: number
}

export default function ProcessSettingCard() {
  const { showLoading, hideLoading } = useLoading()

  const [originalCount, setOriginalCount] = useState<number>(0)
  const [processCount, setProcessCount] = useState<number>(0)

  // 공장 설정 > 프로세스 개수 조회
  const { data, refetch } = useQuery({
    queryKey: ['getFactoryConfigApi'],
    queryFn: getFactoryConfigApi,
    select: (response) => {
      return response.data.processCount
    },
  })

  useEffect(() => {
    if (data) {
      setOriginalCount(data)
      setProcessCount(data)
    }
  }, [data])

  const { mutate } = useMutation({
    mutationFn: updateFactoryConfigApi,
    onSuccess: () => {
      refetch()
    },
    onSettled: () => {
      hideLoading()
    },
  })

  // 변경사항 감지
  const isDirty = useMemo(() => {
    return processCount !== originalCount
  }, [processCount, originalCount])

  // 공정 개수에 따라 공정 목록 생성 (P1, P2, P3...)
  const processes = useMemo(() => {
    return Array.from({ length: processCount }, (_, index) => ({
      id: index + 1,
      name: `P${index + 1}`,
      order: index + 1,
    }))
  }, [processCount])

  const handleSave = () => {
    showLoading()
    mutate({ processCount })
  }

  const handleCancel = () => {
    setProcessCount(originalCount)
  }

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && value <= 20) {
      setProcessCount(value)
    } else if (e.target.value === '') {
      setProcessCount(1)
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              프로세스 설정
            </CardTitle>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={!isDirty}
              className="gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="h-full flex flex-col">
          {/* 공정 개수 설정 */}
          <div className="space-y-4 pb-4 border-b flex-shrink-0">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                공정 개수
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={processCount}
                onChange={handleCountChange}
                className="w-24 h-10 text-center"
              />
              <span className="text-sm text-gray-500">개 (최소 1개, 최대 10개)</span>
            </div>
          </div>

          {/* 공정 목록 미리보기 (스크롤 가능) */}
          <div className="flex-1 overflow-y-auto pt-4">
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {processes.map((process) => (
                  <div
                    key={process.id}
                    className="flex items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium text-gray-900">{process.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
