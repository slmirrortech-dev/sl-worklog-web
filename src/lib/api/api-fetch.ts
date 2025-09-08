export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  })

  if (!res.ok) {
    let message = `API Error: ${res.status}`
    const data = await res.json()
    if (typeof data.message === 'string') {
      message = data.message
    }

    throw new Error(message)
  }

  return (await res.json()) as Promise<T>
}
