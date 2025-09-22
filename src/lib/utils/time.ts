// 분을 특정 포맷으로 변환
export const displayMinutes = (totalMinutes: number) => {
  // 분이 0이면 생략

  const hours = Math.trunc(totalMinutes / 60)
  const minutes = totalMinutes - hours * 60

  if (hours === 0) {
    return `${minutes}분`
  } else if (hours > 0 && minutes === 0) {
    return `${hours}시간`
  } else {
    return `${hours}시간 ${minutes}분`
  }
}
