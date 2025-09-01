export async function uploadLicense(userId: string, file: File) {
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch(`/api/users/${userId}/license-photo`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  })
  const json = await res.json()
  // json.data.licensePhoto → "/uploads/licenses/xxx.jpg"
}
