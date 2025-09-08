import { NextResponse } from 'next/server'
import { ApiError } from './errors'

export class ApiResponseFactory {
  static success<T>(data: T, message = 'OK', status = 200) {
    return NextResponse.json({ success: true, message, data }, { status })
  }

  static error(error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, code: error.code, message: error.message },
        { status: error.status },
      )
    }

    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
      { status: 500 },
    )
  }
}
