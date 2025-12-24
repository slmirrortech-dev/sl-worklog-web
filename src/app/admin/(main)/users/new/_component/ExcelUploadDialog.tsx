'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Role } from '@prisma/client'
import useDialogStore from '@/store/useDialogStore'
import RoleLabel from '@/components/admin/RoleLabel'

interface ParsedEmployee {
  userId: string
  name: string
  hireDate: string | null
  role: Role
}

interface ExcelUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: () => void
}

export default function ExcelUploadDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: ExcelUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedEmployee[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const { showDialog } = useDialogStore()

  // 한글 역할을 영어로 변환
  const convertKoreanRoleToEnglish = (koreanRole: string): string => {
    const roleMap: Record<string, string> = {
      작업자: 'WORKER',
      작업반장: 'MANAGER',
      관리자: 'ADMIN',
      WORKER: 'WORKER',
      MANAGER: 'MANAGER',
      ADMIN: 'ADMIN',
    }
    return roleMap[koreanRole] || koreanRole
  }

  const downloadTemplate = () => {
    const template = [
      { 사번: '123456', 이름: '이름', 입사일: '2025-01-01', 역할: '작업자' },
      { 사번: '123456', 이름: '이름', 입사일: '', 역할: '작업반장' },
      { 사번: '123456', 이름: '이름', 입사일: '', 역할: '관리자' },
    ]

    const ws = XLSX.utils.json_to_sheet(template)

    // 역할 컬럼에 드롭다운 추가 (D열 = 역할)
    // D2부터 D1000까지 드롭다운 적용
    for (let row = 2; row <= 1000; row++) {
      const cellAddress = `D${row}`
      if (!ws[cellAddress]) {
        ws[cellAddress] = { t: 's', v: '' }
      }

      // 데이터 유효성 검사 추가
      if (!ws['!dataValidation']) {
        ws['!dataValidation'] = []
      }

      ws['!dataValidation'].push({
        type: 'list',
        allowBlank: true,
        sqref: cellAddress,
        formulas: ['"작업자,작업반장,관리자"'],
      })
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '직원목록')
    XLSX.writeFile(wb, '직원등록_양식.xlsx')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setParseError(null)

    try {
      const data = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<{
        사번: string
        이름: string
        입사일?: string
        역할: string
      }>(worksheet)

      // 데이터 검증 및 변환
      const parsed: ParsedEmployee[] = []
      const errors: string[] = []

      jsonData.forEach((row, index) => {
        const rowNum = index + 2 // 헤더 포함하여 엑셀 행 번호

        // 필수 필드 검증
        if (!row.사번 || !row.이름) {
          errors.push(`${rowNum}번째 행: 사번과 이름은 필수입니다.`)
          return
        }

        // 역할 검증 (한글 또는 영어)
        const roleInput = String(row.역할 || '작업자').trim()
        const role = convertKoreanRoleToEnglish(roleInput).toUpperCase()
        if (!['WORKER', 'MANAGER', 'ADMIN'].includes(role)) {
          errors.push(
            `${rowNum}번째 행: 역할은 작업자/WORKER, 작업반장/MANAGER, 관리자/ADMIN 중 하나여야 합니다.`,
          )
          return
        }

        // 입사일 형식 검증 (선택 사항)
        let hireDate: string | null = null
        if (row.입사일) {
          const dateStr = String(row.입사일).trim()
          // yyyy-mm-dd 또는 yyyy/mm/dd 형식 지원
          const dateMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
          if (dateMatch) {
            const [, year, month, day] = dateMatch
            hireDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          } else {
            errors.push(`${rowNum}번째 행: 입사일 형식이 올바르지 않습니다 (yyyy-mm-dd)`)
            return
          }
        }

        parsed.push({
          userId: String(row.사번).trim(),
          name: String(row.이름).trim(),
          hireDate,
          role: role as Role,
        })
      })

      if (errors.length > 0) {
        setParseError(errors.join('\n'))
        setParsedData([])
      } else if (parsed.length === 0) {
        setParseError('파일에 유효한 데이터가 없습니다.')
        setParsedData([])
      } else {
        setParsedData(parsed)
      }
    } catch (error) {
      console.error('파일 파싱 오류:', error)
      setParseError('파일을 읽는 중 오류가 발생했습니다.')
      setParsedData([])
    }
  }

  const handleUpload = async () => {
    if (parsedData.length === 0) return

    setIsUploading(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(parsedData),
      })

      const result = await response.json()

      if (!result.success) {
        showDialog({
          type: 'error',
          title: '업로드 실패',
          description: result.error || '직원 등록에 실패했습니다.',
          confirmText: '확인',
        })
        return
      }

      // 결과 메시지 생성
      const messages: string[] = []
      if (result.data.createdCount > 0) {
        messages.push(`신규 등록: ${result.data.createdCount}명`)
      }
      if (result.data.reactivatedCount > 0) {
        messages.push(`복구 등록: ${result.data.reactivatedCount}명`)
      }
      if (result.data.skipped.alreadyActive.length > 0) {
        messages.push(`이미 존재 (건너뜀): ${result.data.skipped.alreadyActive.length}명`)
      }

      showDialog({
        type: 'success',
        title: '업로드 완료',
        description: messages.join('\n'),
        confirmText: '확인',
        onConfirm: () => {
          onOpenChange(false)
          onUploadSuccess()
        },
      })
    } catch (error) {
      console.error('업로드 오류:', error)
      showDialog({
        type: 'error',
        title: '업로드 실패',
        description: '직원 등록 중 오류가 발생했습니다.',
        confirmText: '확인',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setParsedData([])
    setParseError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            엑셀 파일로 직원 일괄 등록
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 템플릿 다운로드 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-2">양식 다운로드</p>
                <p className="text-sm text-blue-700 mb-3">
                  아래 버튼을 클릭하여 엑셀 양식을 다운로드하고, 양식에 맞춰 데이터를 입력하세요.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  양식 다운로드
                </Button>
              </div>
            </div>
          </div>

          {/* 파일 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">엑셀 파일 선택</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && <p className="mt-2 text-sm text-gray-600">선택된 파일: {file.name}</p>}
          </div>

          {/* 파싱 에러 */}
          {parseError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-1">파일 오류</p>
                  <pre className="text-sm text-red-700 whitespace-pre-wrap">{parseError}</pre>
                </div>
              </div>
            </div>
          )}

          {/* 파싱된 데이터 미리보기 */}
          {parsedData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  {parsedData.length}명의 직원 데이터가 준비되었습니다
                </p>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        사번
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        이름
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        입사일
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        역할
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.map((emp, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-gray-900">{emp.userId}</td>
                        <td className="px-3 py-2 text-gray-900">{emp.name}</td>
                        <td className="px-3 py-2 text-gray-600">{emp.hireDate || '-'}</td>
                        <td className="px-3 py-2">
                          <RoleLabel role={emp.role} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              취소
            </Button>
            <Button
              onClick={handleUpload}
              disabled={parsedData.length === 0 || isUploading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? '업로드 중...' : `${parsedData.length}명 등록`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
