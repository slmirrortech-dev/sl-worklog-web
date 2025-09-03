// 단순화: 모든 환경에서 동일하게 처리
export const isDevelopment = () => process.env.NODE_ENV === 'development'
export const isProduction = () => process.env.NODE_ENV === 'production'