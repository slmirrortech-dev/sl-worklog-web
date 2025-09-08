import { ApiResponse } from './response'

/**
 * API 에러 핸들러
 * 에러를 통일된 방식으로 처리해주는 함수
 **/
export function withErrorHandler<T extends (...args: any[]) => Promise<Response>>(handler: T) {
  return async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (err) {
      return ApiResponse.error(err)
    }
  }
}
