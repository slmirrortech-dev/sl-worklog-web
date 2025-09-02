// Vercel 배포를 위한 정적 Swagger 스펙 정의
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Factory Worklog API',
    version: '1.0.0',
    description: '공장 작업 기록 시스템 API',
  },
  servers: [
    {
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      description:
        process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
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
  paths: {
    '/api/auth/login/worker': {
      post: {
        summary: '작업자 로그인',
        description: '작업자 및 관리자 로그인 엔드포인트',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
              example: {
                id: 'admin',
                password: '0000',
              },
            },
          },
        },
        responses: {
          200: {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          401: {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: '서버 오류',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login/admin': {
      post: {
        summary: '관리자 로그인',
        description: '관리자 전용 로그인 엔드포인트',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
              example: {
                id: 'admin',
                password: '0000',
              },
            },
          },
        },
        responses: {
          200: {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          401: {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          403: {
            description: '접근 권한 없음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: '서버 오류',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: '로그아웃',
        description: '사용자 로그아웃',
        tags: ['Auth'],
        responses: {
          200: {
            description: '로그아웃 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          500: {
            description: '서버 오류',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: '현재 사용자 정보',
        description: '로그인한 사용자의 정보를 가져옵니다',
        tags: ['Auth'],
        responses: {
          200: {
            description: '사용자 정보',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: '인증되지 않음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: '서버 오류',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        summary: '사용자 목록 조회',
        description: '페이지네이션을 지원하는 사용자 목록을 가져옵니다',
        tags: ['Users'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: '페이지 번호',
            required: false,
            schema: {
              type: 'integer',
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: '페이지당 항목 수',
            required: false,
            schema: {
              type: 'integer',
              default: 10,
            },
          },
        ],
        responses: {
          200: {
            description: '사용자 목록',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        total: {
                          type: 'integer',
                          description: '전체 사용자 수',
                        },
                        page: {
                          type: 'integer',
                          description: '현재 페이지',
                        },
                        limit: {
                          type: 'integer',
                          description: '페이지당 항목 수',
                        },
                        totalPages: {
                          type: 'integer',
                          description: '전체 페이지 수',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: '인증되지 않음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: '서버 오류',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
}
