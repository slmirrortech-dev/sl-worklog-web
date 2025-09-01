import swaggerJSDoc from 'swagger-jsdoc'

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
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '사용자 ID'
            },
            email: {
              type: 'string',
              description: '이메일'
            },
            name: {
              type: 'string',
              description: '이름'
            },
            role: {
              type: 'string',
              enum: ['WORKER', 'ADMIN'],
              description: '역할'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['id', 'password'],
          properties: {
            id: {
              type: 'string',
              description: '사용자 ID/이메일'
            },
            password: {
              type: 'string',
              description: '비밀번호'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '로그인 성공 여부'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: '에러 메시지'
            }
          }
        }
      }
    }
  },
  apis: ['./src/app/api/**/*.ts'], // API 경로
}

export const swaggerSpec = swaggerJSDoc(options)