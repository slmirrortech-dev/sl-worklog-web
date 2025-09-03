import imageCompression, { type Options } from 'browser-image-compression'

export type CompressResult = { file: File; beforeMB: number; afterMB: number }

export async function compressToTargetMB(
  file: File,
  targetMB = 3,
  maxDim = 2400,
): Promise<CompressResult> {
  const forceJpeg = /heic|heif/i.test(file.type)

  const options: Options = {
    maxSizeMB: targetMB * 0.98,
    maxWidthOrHeight: maxDim,
    initialQuality: 0.8,
    fileType: forceJpeg ? 'image/jpeg' : undefined,
    useWebWorker: true,
    // exifOrientation: 6, // 필요 시 지정(보통 생략)
  }

  const beforeMB = file.size / (1024 * 1024)
  let out = await imageCompression(file, options)

  if (out.size / (1024 * 1024) > targetMB) {
    const retryOpts: Options = {
      ...options,
      initialQuality: 0.72,
      maxWidthOrHeight: Math.round(maxDim * 0.9),
    }
    out = await imageCompression(out, retryOpts)
  }

  return { file: out, beforeMB, afterMB: out.size / (1024 * 1024) }
}
