/**
 * 날짜 형식 검증 (yyyymmdd)
 * 생년월일, 입사일 등에 사용
 */
export function isValidDate(dateStr: string): boolean {
  // 숫자 8자리 검사
  if (!/^\d{8}$/.test(dateStr)) return false

  const year = parseInt(dateStr.substring(0, 4), 10)
  const month = parseInt(dateStr.substring(4, 6), 10)
  const day = parseInt(dateStr.substring(6, 8), 10)

  // 연도 제한 (예: 1900~현재)
  const currentYear = new Date().getFullYear()
  if (year < 1900 || year > currentYear) return false

  // 월 확인
  if (month < 1 || month > 12) return false

  // 일자 확인 (해당 월의 마지막 날 계산)
  const lastDay = new Date(year, month, 0).getDate()
  if (day < 1 || day > lastDay) return false

  return true
}

// 하위 호환성을 위한 별칭
export const isValidBirthday = isValidDate
