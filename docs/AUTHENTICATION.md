# 인증 시스템 문서

## 개요

SL미러텍 공장 관리 시스템의 인증은 Supabase Auth를 기반으로 하며, 사번(userId) 기반 로그인과 초기 비밀번호 변경 기능을 제공합니다.

## 인증 아키텍처

### 사용자 유형

1. **관리자 (ADMIN)**
   - Supabase Auth 사용
   - 사번 기반 로그인
   - 모든 데이터 접근 가능

2. **작업반장 (MANAGER)**
   - Supabase Auth 사용
   - 사번 기반 로그인
   - 작업장 관리 권한

3. **작업자 (WORKER)**
   - Supabase Auth 사용 안 함
   - 로그인 불가
   - DB에만 정보 저장
   - 관리자/반장이 배치 관리

### 인증 플로우

```
직원 등록 → 초기 비밀번호 생성 → 로그인 → 비밀번호 변경 → 작업장 현황
```

## 1. 직원 등록

### API Endpoint

- **POST** `/api/users`
- **권한**: ADMIN, MANAGER

### 요청 형식

```typescript
// 단일 등록
{
  "userId": "2024001",
  "name": "홍길동",
  "birthday": "19900101",
  "role": "MANAGER"
}

// 다중 등록
[
  {
    "userId": "2024001",
    "name": "홍길동",
    "birthday": "19900101",
    "role": "MANAGER"
  },
  {
    "userId": "2024002",
    "name": "김철수",
    "birthday": "19850515",
    "role": "WORKER"
  }
]
```

### 처리 로직

#### 관리자/반장 등록 시

1. 이메일 생성: `${userId}@temp.invalid`
2. 초기 비밀번호 생성: `birthday.slice(2)` (yymmdd 형식)
   - 예: 생년월일 19900101 → 초기 비밀번호 900101
3. Supabase Auth에 사용자 생성
4. Prisma DB에 사용자 정보 저장
5. `mustChangePassword: true` 설정

#### 작업자 등록 시

1. Prisma DB에만 정보 저장
2. Supabase Auth 사용 안 함
3. `mustChangePassword: false` 설정

### 응답 형식

```json
{
  "success": true,
  "message": "사용자 생성/복구 완료",
  "data": {
    "createdCount": 2,
    "reactivatedCount": 0,
    "skipped": {
      "duplicatedInPayload": [],
      "alreadyActive": []
    },
    "data": [...]
  }
}
```

## 2. 로그인

### API Endpoint

- **POST** `/api/auth/login`
- **권한**: 공개 (미인증)

### 요청 형식

```typescript
{
  "userId": "2024001",
  "password": "900101"
}
```

### 처리 로직

1. 사번을 이메일 형식으로 변환: `${userId}@temp.invalid`
2. Supabase Auth로 로그인 (`signInWithPassword`)
3. Prisma DB에서 사용자 정보 조회
4. 권한 확인 (ADMIN 또는 MANAGER만 로그인 가능)
5. 사용자 정보 반환 (mustChangePassword 포함)

### 응답 형식

```json
{
  "id": "clxxxxx",
  "userId": "2024001",
  "name": "홍길동",
  "birthday": "19900101",
  "role": "MANAGER",
  "mustChangePassword": true,
  "licensePhotoUrl": null,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 프론트엔드 처리

```typescript
const response = await loginAdminApi({ userId, password })

if (response.mustChangePassword) {
  // 비밀번호 변경 페이지로 이동
  window.location.href = ROUTES.ADMIN.CHANGE_PASSWORD
} else {
  // 작업장 현황 페이지로 이동
  window.location.href = ROUTES.ADMIN.WORKPLACE
}
```

## 3. 비밀번호 변경

### API Endpoint

- **POST** `/api/auth/change-password`
- **권한**: 인증된 사용자

### 요청 형식

```typescript
{
  "currentPassword": "900101",
  "newPassword": "new_secure_password"
}
```

### 처리 로직

1. 로그인 확인 (Supabase Auth 세션)
2. 유효성 검사
   - 현재 비밀번호와 새 비밀번호 필수
   - 새 비밀번호 최소 6자
   - 현재 비밀번호와 새 비밀번호 다름
3. Supabase Auth 비밀번호 업데이트
4. DB에서 `mustChangePassword: false`로 업데이트

### 응답 형식

```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 변경되었습니다."
}
```

## 4. 미들웨어 보호

### 경로 보호

```typescript
// src/middleware.ts

export async function middleware(req: NextRequest) {
  const { supabase, response } = createMiddlewareClient(req)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 1. 비로그인 사용자 → 로그인 페이지로 리디렉션
  if (!session && pathname.startsWith('/admin')) {
    return NextResponse.redirect(ROUTES.ADMIN.LOGIN)
  }

  // 2. 로그인 사용자가 로그인 페이지 접근 → 작업장 현황으로 리디렉션
  if (session && pathname === ROUTES.ADMIN.LOGIN) {
    return NextResponse.redirect(ROUTES.ADMIN.WORKPLACE)
  }

  // 3. mustChangePassword 체크
  if (session && pathname !== ROUTES.ADMIN.CHANGE_PASSWORD) {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId: session.user.id },
    })

    if (user?.mustChangePassword) {
      // 비밀번호 변경 페이지로 강제 리디렉션
      return NextResponse.redirect(ROUTES.ADMIN.CHANGE_PASSWORD)
    }
  }
}
```

### 보호 경로

- `/admin/workplace` - 작업장 현황
- `/admin/workplace-setting` - 작업장 설정
- `/admin/users` - 직원 관리
- `/admin/my-page` - 마이 페이지

### 공개 경로

- `/admin/login` - 로그인 페이지
- `/admin/change-password` - 비밀번호 변경 페이지
- `/monitor` - 모니터 모드 (완전 공개)

## 5. 보안 고려사항

### 초기 비밀번호

- **생년월일 기반 (yymmdd)**: 보안이 약할 수 있음
- **대책**:
  - 최초 로그인 시 필수 비밀번호 변경
  - 미들웨어에서 강제 리디렉션
  - 변경 전까지 다른 페이지 접근 불가

### 이메일 형식

- **형식**: `${userId}@temp.invalid`
- **이유**:
  - Supabase Auth는 이메일 필수
  - 실제 이메일이 없는 경우 임시 형식 사용
  - `.invalid` TLD는 실제 도메인이 아님 (RFC 2606)

### Session 관리

- **Supabase Auth Cookie**: 자동 관리
- **만료**: Supabase 설정에 따름 (기본 1주일)
- **갱신**: 미들웨어에서 자동 갱신

### RLS (Row Level Security)

- 데이터베이스 레벨 보안
- 사용자 역할별 접근 제어
- 자세한 내용은 `/prisma/rls/README.md` 참조

## 6. 테스트 시나리오

### 신규 관리자 등록 및 로그인

1. **등록**

   ```bash
   POST /api/users
   {
     "userId": "2024001",
     "name": "테스트관리자",
     "birthday": "19900101",
     "role": "ADMIN"
   }
   ```

2. **로그인**
   - 사번: 2024001
   - 비밀번호: 900101 (생년월일 뒤 6자리)

3. **비밀번호 변경**
   - 자동으로 비밀번호 변경 페이지로 이동
   - 현재 비밀번호: 900101
   - 새 비밀번호: 원하는 비밀번호 (최소 6자)

4. **작업장 현황 접근**
   - 비밀번호 변경 완료 후 자동 이동

### 작업자 등록

1. **등록**

   ```bash
   POST /api/users
   {
     "userId": "2024100",
     "name": "작업자1",
     "birthday": "19950315",
     "role": "WORKER"
   }
   ```

2. **결과**
   - Prisma DB에만 저장
   - Supabase Auth 사용자 생성 안 됨
   - 로그인 불가
   - 관리자/반장이 작업 배치에 사용

## 7. API 클라이언트 함수

### 로그인

```typescript
import { loginAdminApi } from '@/lib/api/auth-api'

const response = await loginAdminApi({
  userId: '2024001',
  password: 'password123',
})
```

### 비밀번호 변경

```typescript
import { changePasswordApi } from '@/lib/api/auth-api'

await changePasswordApi({
  currentPassword: '900101',
  newPassword: 'new_secure_password',
})
```

### 로그아웃

```typescript
import { logoutApi } from '@/lib/api/auth-api'

await logoutApi()
```

## 8. 환경 변수

### 필수 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # 서버 전용

# Database
DATABASE_URL=postgresql://...
```

### Supabase Auth 설정

1. Supabase Dashboard > Authentication > Settings
2. Email 인증 비활성화 (임시 이메일 사용)
3. Password 정책 설정
   - 최소 길이: 6자
   - 대문자/소문자/숫자/특수문자 요구사항 설정

## 9. 문제 해결

### 로그인 실패

**증상**: "사번 또는 비밀번호가 일치하지 않습니다" 에러

**해결**:

1. Supabase Dashboard에서 사용자 확인
2. 이메일 형식 확인: `${userId}@temp.invalid`
3. 비밀번호가 생년월일 뒤 6자리인지 확인

### 비밀번호 변경 페이지 무한 루프

**증상**: 비밀번호 변경 후에도 계속 비밀번호 변경 페이지로 이동

**해결**:

1. DB에서 `mustChangePassword` 플래그 확인
2. API가 정상적으로 `false`로 업데이트하는지 확인
3. 브라우저 캐시 삭제

### 미들웨어에서 Prisma 에러

**증상**: Edge Runtime에서 Prisma 사용 불가

**해결**:

- 미들웨어에서 Prisma 사용 대신 Supabase client로 조회
- 또는 API Route에서 검증

## 10. 향후 개선 사항

### 단기

- [ ] 비밀번호 강도 검증 강화
- [ ] 로그인 실패 횟수 제한
- [ ] 비밀번호 찾기 기능 (관리자 재설정)

### 중기

- [ ] 2FA (이중 인증) 추가
- [ ] 세션 활동 로그
- [ ] 비밀번호 변경 이력

### 장기

- [ ] 실제 이메일 주소 사용
- [ ] 이메일 인증
- [ ] 소셜 로그인 (선택사항)

## 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Prisma 문서](https://www.prisma.io/docs)
- [Row Level Security](/prisma/rls/README.md)
