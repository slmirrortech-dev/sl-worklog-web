import { ApiErrorResponse } from '@/types/common'

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    // 서버에서 내려준 응답(JSON)에 status 추가해서 throw
    const error = {
      ...data,
      status: res.status,
    } as ApiErrorResponse & { status: number }
    throw error
  }

  // 성공 케이스는 기존 코드 그대로
  return data as T
}
