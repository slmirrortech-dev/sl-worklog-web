'use client'
import { useState, useRef } from 'react'
import { compressToTargetMB } from '@/utils/imageCompression'
import { uploadLicenseCompressed } from '@/utils/uploadLicense'

const ALLOWED = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
const MAX_SERVER_LIMIT_MB = 5

export default function useLicenseUploader(onUploadComplete?: () => void) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [updatedLicense, setUpdatedLicense] = useState<{ id: string; licensePhoto: string } | null>(
    null,
  )

  async function onChange(e: React.ChangeEvent<HTMLInputElement>, userId: string) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED.includes(file.type)) {
      alert('jpg, png, heic 형식만 업로드 가능합니다.')
      return
    }

    setLoading(true)
    try {
      const { file: compressed, beforeMB, afterMB } = await compressToTargetMB(file, 3, 2400)

      if (afterMB > MAX_SERVER_LIMIT_MB) {
        alert(`압축 후에도 ${afterMB.toFixed(2)}MB → 너무 큽니다. 해상도를 낮춰주세요.`)
        return
      }

      const result = await uploadLicenseCompressed(userId, compressed)
      setUpdatedLicense(result.data)
      // alert(`업로드 완료! (${beforeMB.toFixed(2)}MB → ${afterMB.toFixed(2)}MB)`)
      onUploadComplete?.()
    } catch (err: any) {
      alert(err?.message || '업로드 실패')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return { inputRef, loading, onChange, updatedLicense }
}
