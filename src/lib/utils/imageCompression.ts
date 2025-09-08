import imageCompression, { type Options } from 'browser-image-compression'

export type CompressResult = { file: File; beforeMB: number; afterMB: number }

export async function compressToTargetMB(
  file: File,
  targetMB = 0.5, // 1.5MB → 0.5MB로 대폭 축소
  maxDim = 600, // 1280px → 600px로 축소 (면허증 확인용으로 충분)
): Promise<CompressResult> {
  const forceJpeg = /heic|heif|png/i.test(file.type) // PNG도 JPEG로 변환

  const options: Options = {
    maxSizeMB: targetMB * 0.98,
    maxWidthOrHeight: maxDim,
    initialQuality: 0.85, // 0.8 → 0.85로 품질 약간 향상하면서도 용량 절약
    fileType: forceJpeg ? 'image/jpeg' : undefined,
    useWebWorker: true,
    alwaysKeepResolution: false, // 해상도 조정 허용으로 파일 크기 최적화
  }

  const beforeMB = file.size / (1024 * 1024)
  let out = await imageCompression(file, options)

  if (out.size / (1024 * 1024) > targetMB) {
    const retryOpts: Options = {
      ...options,
      initialQuality: 0.75, // 0.72 → 0.75로 약간 향상
      maxWidthOrHeight: Math.round(maxDim * 0.85), // 0.9 → 0.85로 더 적극적 압축
    }
    out = await imageCompression(out, retryOpts)
  }

  return { file: out, beforeMB, afterMB: out.size / (1024 * 1024) }
}
