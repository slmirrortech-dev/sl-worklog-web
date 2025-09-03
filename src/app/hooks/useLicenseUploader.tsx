'use client'
import React, { useState, useRef } from 'react'
import { compressToTargetMB } from '@/utils/imageCompression'
import { uploadLicenseCompressed } from '@/utils/uploadLicense'

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']
const MAX_SERVER_LIMIT_MB = 5

const useLicenseUploader = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [msg, setMsg] = useState<string>()
  const [loading, setLoading] = useState(false)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>, userId: string) {
    const file = e.target.files?.[0]
    if (!file) return

    // 1) 클라 1차 검증
    if (!ALLOWED.includes(file.type)) {
      setMsg('jpg, jpeg, png(또는 heic)만 업로드 가능합니다.')
      return
    }

    setLoading(true)
    try {
      // 2) 3MB 목표로 압축
      const { file: compressed, beforeMB, afterMB } = await compressToTargetMB(file, 3, 2400)

      // 3) 서버 제한(5MB)보다 확실히 작은지 확인 (예외 케이스 방어)
      if (afterMB > MAX_SERVER_LIMIT_MB) {
        setMsg(
          `압축 후에도 여전히 너무 큽니다(${afterMB.toFixed(2)}MB). 사진 해상도를 낮춰 다시 시도해주세요.`,
        )
        return
      }

      // 4) 서버 API로 전송
      const result = await uploadLicenseCompressed(userId, compressed)
      setMsg(`업로드 완료! (${beforeMB.toFixed(2)}MB → ${afterMB.toFixed(2)}MB)`)

      // 필요 시 result.previewUrl로 썸네일 표시 가능
      // e.g., setPreview(result.previewUrl)
    } catch (err: any) {
      setMsg(err?.message || '업로드 실패')
    } finally {
      setLoading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return {
    inputRef,
    msg,
    loading,
    onChange,
  }
}

export default useLicenseUploader
