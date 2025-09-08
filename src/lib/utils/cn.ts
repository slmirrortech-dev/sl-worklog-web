import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// clsx: 여러 개의 className 문자열을 조건부로 합쳐주는 유틸
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
