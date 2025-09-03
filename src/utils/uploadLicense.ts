export async function uploadLicenseCompressed(userId: string, file: File) {
  const fd = new FormData()
  fd.set('file', file)

  const res = await fetch(`/api/users/${userId}/license-photo`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json?.message || '업로드 실패')
  return json as { success: boolean; data: { id: string; licensePhoto: string } }
}
