import { ApiResponse } from './response'

export function withErrorHandler<T extends (...args: any[]) => Promise<Response>>(handler: T) {
  return async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (err) {
      return ApiResponse.error(err)
    }
  }
}
