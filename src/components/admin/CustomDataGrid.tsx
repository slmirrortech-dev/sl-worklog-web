'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CustomDataGrid({
  id = '',
  data,
  columns,
  onRowClick,
  page,
  pageSize,
  totalCount,
  loading = false,
  setPage,
  setPageSize,
  enableSelection = false,
  selectedIds,
  onSelectionChange,
  getRowId,
  onSelectAll,
  children,
}: {
  id: string
  data: any[]
  columns: ColumnDef<any>[]
  onRowClick?: any
  page: number
  pageSize: number
  totalCount: number
  loading?: boolean
  setPage: any
  setPageSize: any
  enableSelection?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (selectedIds: Set<string>) => void
  getRowId?: (row: any) => string
  onSelectAll?: () => Promise<string[]>
  children?: React.ReactNode
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isMobile, setIsMobile] = useState(false)

  // 체크박스 컬럼 추가
  const columnsWithSelection = useMemo(() => {
    if (!enableSelection) return columns

    const selectionColumn: ColumnDef<any> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={selectedIds?.size === totalCount && totalCount > 0}
          onChange={async (e) => {
            if (e.target.checked) {
              // 전체 선택
              if (onSelectAll) {
                try {
                  const allIds = await onSelectAll()
                  onSelectionChange?.(new Set(allIds))
                } catch (error) {
                  console.error('전체 선택 실패:', error)
                }
              }
            } else {
              // 전체 해제
              onSelectionChange?.(new Set())
            }
          }}
          className="w-4 h-4 cursor-pointer"
        />
      ),
      cell: ({ row }) => {
        const rowId = getRowId?.(row.original) || row.original.id
        return (
          <input
            type="checkbox"
            checked={selectedIds?.has(rowId) || false}
            onChange={(e) => {
              const newSelectedIds = new Set(selectedIds)
              if (e.target.checked) {
                newSelectedIds.add(rowId)
              } else {
                newSelectedIds.delete(rowId)
              }
              onSelectionChange?.(newSelectedIds)
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer"
          />
        )
      },
      size: 40,
      meta: {
        className: 'w-10',
      },
    }

    return [selectionColumn, ...columns]
  }, [
    columns,
    enableSelection,
    selectedIds,
    onSelectionChange,
    data,
    getRowId,
    totalCount,
    onSelectAll,
  ])

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize)
  }, [totalCount, pageSize])

  // 페이지 크기 옵션 생성 (총 데이터 수와 성능 고려)
  const getPageSizeOptions = (totalCount: number, currentPageSize: number) => {
    const baseOptions = [5, 10, 20, 50]
    const validOptions = baseOptions.filter((size) => size < totalCount)

    // 100개 이하일 때만 "전체" 옵션 추가
    if (totalCount <= 100 && totalCount > 0) {
      validOptions.push(totalCount)
    }

    // 현재 pageSize가 totalCount보다 크면 totalCount를 사용
    const effectivePageSize = currentPageSize > totalCount ? totalCount : currentPageSize

    // 현재 pageSize가 옵션에 없으면 추가
    if (!validOptions.includes(effectivePageSize)) {
      validOptions.push(effectivePageSize)
      validOptions.sort((a, b) => a - b)
    }

    return validOptions
  }

  // 현재 pageSize가 totalCount보다 큰 경우 표시용 값 조정
  const getDisplayPageSize = (currentPageSize: number, totalCount: number) => {
    return currentPageSize > totalCount ? totalCount : currentPageSize
  }

  // 클라이언트에서 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
  })

  return (
    <div className="w-full">
      {/* 검색 및 필터 영역 */}
      <div className="p-4 md:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="whitespace-nowrap">총 {totalCount}개 항목</span>
            {enableSelection && selectedIds && selectedIds.size > 0 && (
              <>
                <span className="text-gray-400">|</span>
                <span className="whitespace-nowrap text-blue-600 font-medium">
                  {selectedIds.size}개 선택됨
                </span>
              </>
            )}
            <span className="text-gray-400 hidden md:inline">|</span>
            <span className="whitespace-nowrap hidden md:inline">
              {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} 표시 중
            </span>
          </div>
          {children}
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-200 bg-gray-50/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`py-3 md:py-4 font-medium text-gray-700 text-sm md:text-base text-center ${
                        header.column.id === 'select' ? 'px-1 md:px-2 w-10' : 'px-3 md:px-6'
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columnsWithSelection.length} className="h-32 text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="text-base md:text-lg font-medium mb-2">
                      데이터를 불러오는 중...
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel()?.rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`py-3 md:py-4 text-gray-900 text-sm md:text-base text-center ${
                        cell.column.id === 'select' ? 'px-1 md:px-2 w-10' : 'px-2 md:px-3'
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnsWithSelection.length} className="h-32 text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="text-base md:text-lg font-medium mb-2">데이터가 없습니다</div>
                    <div className="text-sm">검색 조건을 변경해주세요</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50/50">
        {/* 페이지 크기 선택 */}
        <div className="flex items-center justify-center md:justify-end">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 whitespace-nowrap">페이지당</span>
            <Select
              value={getDisplayPageSize(pageSize, totalCount).toString()}
              onValueChange={(value) => {
                setPage(1)
                setPageSize(Number(value))
              }}
              disabled={getPageSizeOptions(totalCount, pageSize).length <= 1}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getPageSizeOptions(totalCount, pageSize).map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size === totalCount ? '전체' : size.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-600 whitespace-nowrap">개씩</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 order-1 md:order-2">
          {/* 이전 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1 || loading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed h-8 px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* 숫자 버튼들 */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNumber = i + 1
              const currentPage = page

              // 모바일에서는 더 적은 페이지 버튼 표시
              const maxVisiblePages = isMobile ? 3 : 7

              if (totalPages > maxVisiblePages) {
                if (pageNumber === 1 || pageNumber === totalPages) {
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNumber)}
                      className={`h-8 w-8 p-0 text-xs md:text-sm ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  )
                } else if (
                  pageNumber >= currentPage - (isMobile ? 0 : 1) &&
                  pageNumber <= currentPage + (isMobile ? 0 : 1)
                ) {
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNumber)}
                      className={`h-8 w-8 p-0 text-xs md:text-sm ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  )
                } else if (
                  (pageNumber === 2 && currentPage > (isMobile ? 3 : 4)) ||
                  (pageNumber === totalPages - 1 && currentPage < totalPages - (isMobile ? 2 : 3))
                ) {
                  return (
                    <span key={i} className="px-1 md:px-2 text-gray-400 text-xs">
                      ...
                    </span>
                  )
                }
                return null
              } else {
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                    className={`h-8 w-8 p-0 text-xs md:text-sm ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </Button>
                )
              }
            })}
          </div>

          {/* 다음 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed h-8 px-3"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
