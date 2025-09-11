export function isValidBirthday(birthday: string): boolean {
  // 숫자 8자리 검사
  if (!/^\d{8}$/.test(birthday)) return false

  const year = parseInt(birthday.substring(0, 4), 10)
  const month = parseInt(birthday.substring(4, 6), 10)
  const day = parseInt(birthday.substring(6, 8), 10)

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
