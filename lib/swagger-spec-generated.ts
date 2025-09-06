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
  paths: {
    '/api/auth/login/admin': {
      post: {
        summary: '관리자 로그인',
        description: '관리자 전용 로그인 엔드포인트',
        tags: [
          'Auth',
        ],
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
          '200': {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          '401': {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: '권한 없음 (관리자만 접근 가능)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
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
    '/api/auth/login/worker': {
      post: {
        summary: '작업자 로그인',
        description: '작업자 및 관리자 로그인 엔드포인트',
        tags: [
          'Auth',
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
              example: {
                id: 'worker01',
                password: '0000',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          '401': {
            description: '인증 실패',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
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
        description: '세션 쿠키를 삭제하여 로그아웃',
        tags: [
          'Auth',
        ],
        responses: {
          '200': {
            description: '로그아웃 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          '500': {
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
        summary: '현재 로그인 사용자 정보 조회',
        description: '세션 쿠키를 통해 현재 로그인한 사용자 정보를 반환',
        tags: [
          'Auth',
        ],
        responses: {
          '200': {
            description: '인증된 사용자 정보',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: '인증되지 않음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
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
    '/api/line-process': {
      get: {
        summary: '작업장 정보 조회 (라인, 공정 통합)',
        tags: [
          'LineProcess',
        ],
        parameters: [
          {
            in: 'query',
            name: 'isActive',
            schema: {
              type: 'boolean',
              default: true,
              required: false,
              description: '활성 상태 필터 (true=활성, false=비활성)',
            },
          },
        ],
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: '작업장 정보 조회 성공',
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: '권한 없음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: '없음',
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
      put: {
        summary: '작업장 정보 수정 (라인, 공정 통합)',
        tags: [
          'LineProcess',
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: '라인+프로세스 전체 구조 (자세한 필드는 생략)',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: '작업장 정보 수정 성공',
                    },
                    data: {
                      $ref: '#/components/schemas/SaveLineDto',
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: '권한 없음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: '없음',
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
    '/api/users/{id}': {
      get: {
        summary: '특정 사용자 조회',
        tags: [
          'User',
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
            description: '사용자 ID',
          },
        ],
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: '사용자 조회 성공',
                    },
                    data: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: '권한 없음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: '없음',
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
      patch: {
        summary: '사용자 정보 수정',
        tags: [
          'User',
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: '사용자 수정 성공',
                    },
                    data: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: '잘못된 입력',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: '권한 없음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: '없음',
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
      delete: {
        summary: '사용자 영구 삭제',
        tags: [
          'User',
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: '사용자 삭제 성공',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: 'clx123abc',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '403': {
            description: '권한 없음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: '없음',
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
        summary: '모든 직원 목록',
        description: '모든 직원 목록을 조회한다',
        tags: [
          'User',
        ],
        parameters: [
          {
            in: 'query',
            name: 'role',
            schema: {
              type: 'string',
              enum: [
                'ADMIN',
                'WORKER',
              ],
            },
            description: '필터할 역할 (미지정 시 전체)',
          },
          {
            in: 'query',
            name: 'search',
            schema: {
              type: 'string',
            },
            description: '사번 또는 이름으로 검색',
          },
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'number',
              default: 1,
            },
            description: '페이지',
          },
          {
            in: 'query',
            name: 'pageSize',
            schema: {
              type: 'number',
              default: 10,
            },
            description: '페이지 사이즈',
          },
        ],
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
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
      post: {
        summary: '신규 사용자 등록(단일 또는 다건)',
        tags: [
          'User',
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    required: [
                      'loginId',
                      'name',
                    ],
                    properties: {
                      loginId: {
                        type: 'string',
                        description: '사번/로그인ID',
                      },
                      name: {
                        type: 'string',
                      },
                      role: {
                        type: 'string',
                        enum: [
                          'ADMIN',
                          'WORKER',
                        ],
                        default: 'WORKER',
                      },
                      licensePhoto: {
                        type: 'string',
                        nullable: true,
                      },
                      adminMemo: {
                        type: 'string',
                        nullable: true,
                      },
                      isActive: {
                        type: 'boolean',
                        default: true,
                      },
                    },
                  },
                  {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: [
                        'loginId',
                        'name',
                      ],
                      properties: {
                        loginId: {
                          type: 'string',
                        },
                        name: {
                          type: 'string',
                        },
                        role: {
                          type: 'string',
                          enum: [
                            'ADMIN',
                            'WORKER',
                          ],
                          default: 'WORKER',
                        },
                        licensePhoto: {
                          type: 'string',
                          nullable: true,
                        },
                        adminMemo: {
                          type: 'string',
                          nullable: true,
                        },
                        isActive: {
                          type: 'boolean',
                          default: true,
                        },
                      },
                    },
                  },
                ],
              },
              examples: {
                single: {
                  value: {
                    loginId: 'W00123',
                    name: '홍길동',
                    role: 'WORKER',
                  },
                },
                multiple: {
                  value: [
                    {
                      loginId: 'W00123',
                      name: '홍길동',
                      role: 'WORKER',
                    },
                    {
                      loginId: 'A00001',
                      name: '관리자',
                      role: 'ADMIN',
                    },
                  ],
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: '생성됨',
          },
          '400': {
            description: '잘못된 요청',
          },
          '403': {
            description: '권한 없음',
          },
          '409': {
            description: '일부/전부 중복',
          },
        },
      },
    },
    '/api/work-log': {
      get: {
        summary: '작업 기록 조회',
        description: '작업 기록을 조건에 따라 조회한다',
        tags: [
          'WorkLog',
        ],
        parameters: [
          {
            in: 'query',
            name: 'searchStartAt',
            schema: {
              type: 'string',
              format: 'date-time',
            },
            description: '검색 시작일 (ISO 8601 형식)',
          },
          {
            in: 'query',
            name: 'searchEndAt',
            schema: {
              type: 'string',
              format: 'date-time',
            },
            description: '검색 종료일 (ISO 8601 형식)',
          },
          {
            in: 'query',
            name: 'searchShiftType',
            schema: {
              type: 'string',
              enum: [
                'DAY_NORMAL',
                'DAY_OVERTIME',
                'NIGHT_NORMAL',
                'NIGHT_OVERTIME',
                'UNKNOWN',
              ],
            },
            description: '근무 형태 필터',
          },
          {
            in: 'query',
            name: 'searchLineId',
            schema: {
              type: 'string',
            },
            description: '라인 ID (또는 스냅샷 lineName)',
          },
          {
            in: 'query',
            name: 'searchProcessId',
            schema: {
              type: 'string',
            },
            description: '공정 ID (또는 스냅샷 processName)',
          },
          {
            in: 'query',
            name: 'searchIsDefective',
            schema: {
              type: 'boolean',
            },
            description: '불량 여부 (true/false)',
          },
          {
            in: 'query',
            name: 'searchWorker',
            schema: {
              type: 'string',
            },
            description: '직원 사번 또는 이름으로 검색',
          },
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'number',
              default: 1,
            },
            description: '페이지 번호 (1 이상)',
          },
          {
            in: 'query',
            name: 'pageSize',
            schema: {
              type: 'number',
              default: 10,
            },
            description: '페이지 사이즈 (1 이상)',
          },
        ],
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
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
  tags: [],
}
