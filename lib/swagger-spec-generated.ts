// 자동 생성된 Swagger 스펙 - scripts/generate-swagger.js에서 생성
// API 라우트의 JSDoc 주석을 기반으로 자동 생성됩니다
export const swaggerSpec = {
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
            enum: [
              'WORKER',
              'ADMIN',
            ],
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
        required: [
          'id',
          'password',
        ],
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
  paths: {},
  tags: [],
}
