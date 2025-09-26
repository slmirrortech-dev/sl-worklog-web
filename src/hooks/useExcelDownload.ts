import { useState } from 'react'
import * as XLSX from 'xlsx'
import { WorkLogResponseModel } from '@/types/work-log'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export const useExcelDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadWorkLogExcel = async (
    data: WorkLogResponseModel[],
    filename: string = '작업기록',
  ) => {
    try {
      setIsDownloading(true)

      // 엑셀에 표시할 데이터 변환
      const excelData = data.map((item, index) => ({
        no: index + 1,
        shiftType: item.shiftType === 'DAY' ? '주간' : '야간',
        status:
          item.workStatus === 'NORMAL' ? '정상' : item.workStatus === 'OVERTIME' ? '연장' : '심야',
        classNo: item.lineClassNo,
        lineName: item.lineName,
        processName: item.processName,
        userName: item.userName,
        userId: item.userUserId,
        startTime: format(item.startedAt, 'yyyy-MM-dd HH:mm', { locale: ko }),
        endTime: item.endedAt
          ? format(item.endedAt, 'yyyy-MM-dd HH:mm', { locale: ko })
          : '진행 중',
        duration: item.endedAt
          ? `${Math.floor(item.durationMinutes / 60)}시간 ${item.durationMinutes % 60}분`
          : '-',
        isDefective: item.isDefective ? '불량' : '정상',
      }))

      // 워크북 생성
      const workbook = XLSX.utils.book_new()

      // 워크시트 생성 (헤더 매핑 포함)
      const worksheet = XLSX.utils.json_to_sheet(excelData, {
        header: [
          'no',
          'shiftType',
          'status',
          'classNo',
          'lineName',
          'processName',
          'userName',
          'userId',
          'startTime',
          'endTime',
          'duration',
          'isDefective',
        ],
      })

      // 한글 헤더로 변경
      const koreanHeaders = [
        '번호',
        '시간대',
        '상태',
        '반',
        '라인',
        '공정',
        '작업자',
        '사번',
        '시작시간',
        '종료시간',
        '작업시간',
        '불량여부',
      ]

      // 첫 번째 행의 헤더를 한글로 변경
      koreanHeaders.forEach((header, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index })
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].v = header
        }
      })

      // 컬럼 너비 설정
      worksheet['!cols'] = [
        { wch: 8 }, // 번호
        { wch: 10 }, // 시간대
        { wch: 10 }, // 상태
        { wch: 8 }, // 반
        { wch: 15 }, // 라인
        { wch: 15 }, // 공정
        { wch: 12 }, // 작업자
        { wch: 12 }, // 사번
        { wch: 18 }, // 시작시간
        { wch: 18 }, // 종료시간
        { wch: 12 }, // 작업시간
        { wch: 10 }, // 불량여부
      ]

      // 워크시트를 워크북에 추가
      XLSX.utils.book_append_sheet(workbook, worksheet, '작업기록')

      // 파일명 생성 (현재 날짜 포함)
      const currentDate = format(new Date(), 'yyyyMMdd_HHmmss', { locale: ko })
      const finalFilename = `${filename}_${currentDate}.xlsx`

      // 엑셀 파일 다운로드
      XLSX.writeFile(workbook, finalFilename)
    } catch (error) {
      console.error('Excel download error:', error)
      throw new Error('엑셀 다운로드 중 오류가 발생했습니다.')
    } finally {
      setIsDownloading(false)
    }
  }

  return {
    downloadWorkLogExcel,
    isDownloading,
  }
}
