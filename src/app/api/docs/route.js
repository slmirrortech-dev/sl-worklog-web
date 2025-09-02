import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 빌드타임에 생성된 스펙을 사용
    const { swaggerSpec } = await import('../../../../lib/swagger-spec-generated')
    return NextResponse.json(swaggerSpec)
  } catch (error) {
    // 생성된 스펙이 없으면 fallback으로 수동 스펙 사용
    const { swaggerSpec: fallbackSpec } = await import('../../../../lib/swagger-spec')
    return NextResponse.json(fallbackSpec)
  }
}
