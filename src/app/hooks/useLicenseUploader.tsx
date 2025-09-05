'use client'
import { useState, useRef, useEffect } from 'react'
import { compressToTargetMB } from '@/utils/imageCompression'
import { uploadLicenseCompressed } from '@/utils/uploadLicense'

const ALLOWED = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
const MAX_SERVER_LIMIT_MB = 5

export default function useLicenseUploader(
  userId?: string,
  licensePhoto?: string | null,
  onUploadComplete?: () => void,
) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<string>('')
  const [updatedLicense, setUpdatedLicense] = useState<{ id: string; licensePhoto: string } | null>(
    null,
  )

  // 이미지 URL 관련 상태들
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState<boolean>(false)
  const [imageError, setImageError] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState<number>(0)

  // 이미지 URL 가져오기 함수
  const fetchLicenseUrl = async (targetUserId: string) => {
    if (!targetUserId) return

    setImageLoading(true)
    setImageError(false)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

      const res = await fetch(`/api/users/${targetUserId}/license-photo/url`, {
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const { url } = await res.json()
      if (url) {
        // 이미지 프리로드로 실제 로딩 시간 단축
        const img = new Image()
        img.onload = () => {
          setLicenseUrl(url)
          setImageError(false)
          setImageLoading(false)
        }
        img.onerror = () => {
          setImageError(true)
          setImageLoading(false)
        }
        img.src = url
      } else {
        setLicenseUrl(null)
        setImageLoading(false)
      }
    } catch (error) {
      console.error('URL 가져오기 실패:', error)
      setImageError(true)
      setLicenseUrl(null)
      setImageLoading(false)
    }
  }

  // URL 자동 가져오기
  useEffect(() => {
    if (userId && licensePhoto) {
      fetchLicenseUrl(userId)
    } else {
      setLicenseUrl(null)
      setImageLoading(false)
      setImageError(false)
    }
  }, [userId, licensePhoto, updatedLicense, retryCount])

  // 재시도 함수
  const retryFetchUrl = () => {
    setRetryCount((prev) => prev + 1)
    setImageError(false)
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>, targetUserId?: string) {
    const actualUserId = targetUserId || userId
    if (!actualUserId) return
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED.includes(file.type)) {
      alert('jpg, png, heic 형식만 업로드 가능합니다.')
      return
    }

    setLoading(true)

    // 타임아웃 설정 (30초)
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setLoadingStep('')
      alert('업로드 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.')
    }, 30000)

    try {
      setLoadingStep('이미지 압축 중...')
      const { file: compressed, beforeMB, afterMB } = await compressToTargetMB(file, 3, 2400)

      if (afterMB > MAX_SERVER_LIMIT_MB) {
        alert(`압축 후에도 ${afterMB.toFixed(2)}MB → 너무 큽니다. 해상도를 낮춰주세요.`)
        return
      }

      setLoadingStep('서버에 업로드 중...')
      const result = await uploadLicenseCompressed(actualUserId, compressed)

      setLoadingStep('업로드 완료!')
      setUpdatedLicense(result.data)
      onUploadComplete?.()

      // 성공 시 잠시 상태 유지 후 리셋
      setTimeout(() => {
        setLoadingStep('')
      }, 1000)
    } catch (err: any) {
      console.error('Upload error:', err)
      const errorMessage = err?.message || '업로드 실패'
      alert(`${errorMessage}\n\n다시 시도해보시고 계속 문제가 발생하면 관리자에게 문의하세요.`)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return {
    inputRef,
    loading,
    loadingStep,
    onChange,
    updatedLicense,
    // 이미지 URL 관련
    licenseUrl,
    imageLoading,
    imageError,
    retryFetchUrl,
    fetchLicenseUrl, // 수동으로 URL 가져오기용
  }
}
