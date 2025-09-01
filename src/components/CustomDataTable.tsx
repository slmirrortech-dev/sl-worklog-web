'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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

export function CustomDataTable({
  data,
  columns,
  onRowClick,
}: {
  data: any[]
  columns: ColumnDef<any>[]
  showCheckboxes?: boolean
  onRowClick?: (row: any) => void
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isMobile, setIsMobile] = React.useState(false)

  // 클라이언트에서 화면 크기 감지
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="w-full">
      {/* 검색 및 필터 영역 */}
      <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <Input
              placeholder="사번 또는 이름으로 검색"
              value={globalFilter ?? ''}
              onChange={event => {
                const value = event.target.value
                setGlobalFilter(value)
              }}
              className="w-full md:max-w-xs bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* 페이지 크기 선택 */}
          <div className="flex items-center justify-center md:justify-end">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 whitespace-nowrap">페이지당</span>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={value => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-gray-600 whitespace-nowrap">개씩</span>
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-gray-200 bg-gray-50/50"
              >
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      className="py-3 md:py-4 px-3 md:px-6 text-left font-medium text-gray-700 text-sm md:text-base"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors duration-150"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className="py-3 md:py-4 px-3 md:px-6 text-gray-900 text-sm md:text-base"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center py-12"
                >
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="text-base md:text-lg font-medium mb-2">
                      데이터가 없습니다
                    </div>
                    <div className="text-sm">직원을 등록해주세요.</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm text-gray-600 order-2 md:order-1">
          <span className="whitespace-nowrap">
            총 {table.getFilteredRowModel().rows.length}개 항목
          </span>
          <span className="text-gray-400 hidden md:inline">|</span>
          <span className="whitespace-nowrap hidden md:inline">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
            -
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            표시 중
          </span>
        </div>

        <div className="flex items-center space-x-2 order-1 md:order-2">
          {/* 이전 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed h-8 px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* 숫자 버튼들 */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => {
              const pageNumber = i + 1
              const currentPage = table.getState().pagination.pageIndex + 1
              const totalPages = table.getPageCount()

              // 모바일에서는 더 적은 페이지 버튼 표시
              const maxVisiblePages = isMobile ? 3 : 7

              if (totalPages > maxVisiblePages) {
                if (pageNumber === 1 || pageNumber === totalPages) {
                  return (
                    <Button
                      key={i}
                      variant={
                        currentPage === pageNumber ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => table.setPageIndex(i)}
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
                      variant={
                        currentPage === pageNumber ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => table.setPageIndex(i)}
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
                  (pageNumber === totalPages - 1 &&
                    currentPage < totalPages - (isMobile ? 2 : 3))
                ) {
                  return (
                    <span
                      key={i}
                      className="px-1 md:px-2 text-gray-400 text-xs"
                    >
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
                    onClick={() => table.setPageIndex(i)}
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
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed h-8 px-3"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
