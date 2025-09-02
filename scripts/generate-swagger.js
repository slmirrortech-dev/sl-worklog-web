const swaggerJSDoc = require('swagger-jsdoc')
const fs = require('fs')
const path = require('path')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Factory Worklog API',
      version: '1.0.0',
      description: '공장 작업 기록 시스템 API',
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '사용자 고유 ID',
            },
            loginId: {
              type: 'string',
              description: '로그인 ID (사번)',
            },
            name: {
              type: 'string',
              description: '사용자 이름',
            },
            role: {
              type: 'string',
              enum: ['WORKER', 'ADMIN'],
              description: '사용자 역할',
            },
            isSuperAdmin: {
              type: 'boolean',
              description: '최고관리자 여부',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['id', 'password'],
          properties: {
            id: {
              type: 'string',
              description: '로그인 ID (사번)',
            },
            password: {
              type: 'string',
              description: '비밀번호',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '로그인 성공 여부',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: '에러 메시지',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '성공 여부',
              example: true,
            },
            message: {
              type: 'string',
              description: '성공 메시지',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/app/api/**/*.ts',
    './src/app/api/**/*.js'
  ],
}

// Swagger 스펙 생성
const swaggerSpec = swaggerJSDoc(options)

// TypeScript 파일로 저장 - JavaScript 객체 형태로 변환
const generateObjectString = (obj, indent = 0) => {
  const spaces = '  '.repeat(indent)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    const items = obj.map(item => 
      typeof item === 'object' && item !== null 
        ? generateObjectString(item, indent + 1)
        : JSON.stringify(item)
    ).join(',\n' + '  '.repeat(indent + 1))
    return `[\n${'  '.repeat(indent + 1)}${items},\n${spaces}]`
  } else if (typeof obj === 'object' && obj !== null) {
    const entries = Object.entries(obj)
    if (entries.length === 0) return '{}'
    const props = entries.map(([key, value]) => {
      const formattedValue = typeof value === 'object' && value !== null
        ? generateObjectString(value, indent + 1)
        : JSON.stringify(value)
      return `${spaces}  ${key}: ${formattedValue}`
    }).join(',\n')
    return `{\n${props},\n${spaces}}`
  }
  return JSON.stringify(obj)
}

const output = `// 자동 생성된 Swagger 스펙 - scripts/generate-swagger.js에서 생성
// API 라우트의 JSDoc 주석을 기반으로 자동 생성됩니다
export const swaggerSpec = ${generateObjectString(swaggerSpec)}
`

const outputPath = path.join(__dirname, '../lib/swagger-spec-generated.ts')
fs.writeFileSync(outputPath, output, 'utf8')

console.log('✅ Swagger spec generated at:', outputPath)
console.log('📝 Found', Object.keys(swaggerSpec.paths || {}).length, 'API endpoints')