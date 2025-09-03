export async function uploadLicenseCompressed(
  userId: string,
  file: File,
  endpoint = `/api/users/${userId}/license-photo`,
) {
  const fd = new FormData()
  fd.set('file', file) // 압축된 파일

  const res = await fetch(endpoint, {
    method: 'POST',
    body: fd,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || '업로드 실패')
  return json // { success, data: { id, licensePhoto }, previewUrl? }
}
