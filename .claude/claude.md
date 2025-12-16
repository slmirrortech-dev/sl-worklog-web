# SL미러텍 공장 관리 시스템 🏭

## 프로젝트 개요

SL미러텍의 작업자 배치와 공정 관리를 디지털화한 웹 기반 공장 관리 시스템입니다.
기존 칠판과 엑셀로 관리하던 작업자/공정 관리를 실시간으로 관리하고 공유할 수 있도록 개발되었습니다.

### 주요 모드

1. **관리자 모드** (PC/Mobile 반응형)
   - 작업장 현황 : 라인별 상태 관리, 작업자 배치 관리
   - 작업장 관리 : 라인, 공정 설정 (진입 시 작업장 현황 Lock)
   - 작업자 관리 : 관리자, 작업반장, 작업자 등록/수정/삭제, 교육 이력, 불량 발생 여부, 공정면허증 관리

2. **모니터 모드** (대형 TV 최적화)
   - 로그인 없이 공장 현황 실시간 조회

## 기술 스택

### Frontend

- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **State Management**: Tanstack Query v5.90.1
- **Styling**: Tailwind CSS v4, shadcn UI

### Backend

- **API**: Next.js API Routes
- **ORM**: Prisma 6.15.0
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

### Infrastructure

- **Hosting**: Vercel
- **Database**: Supabase
- **Local Development**: Docker (PostgreSQL)

## 프로젝트 구조

## 데이터베이스 구조

### 주요 모델

## 개발 워크플로우

### 환경 설정

프로젝트는 3가지 환경을 지원합니다:

- **local**: `.env.local` - 로컬 Docker DB
- **development**: `.env.development` - 개발 Supabase
- **production**: `.env.production` - 운영 Supabase

### 주요 스크립트

```bash
# 개발 서버
npm run dev:local      # 로컬 환경
npm run dev:dev        # 개발 환경
npm run dev:prod       # 운영 환경 (주의!)

# 빌드
npm run build:local
npm run build:dev
npm run build:prod

# 데이터베이스
npm run db             # Prisma Studio (로컬)
npm run db:sync        # DB 스키마 동기화
npm run db:seed        # 시드 데이터 입력
npm run db:reset       # DB 초기화 (주의!)

# 코드 품질
npm run lint           # ESLint 검사
npm run lint:fix       # ESLint 자동 수정
npm run format         # Prettier 포맷팅
npm run format:check   # Prettier 검사
```

### 데이터베이스 마이그레이션

```bash
# 개발 환경에서 스키마 변경 후
npm run db:sync:dev    # prisma migrate deploy

# 운영 환경에 배포
npm run db:sync:prod   # prisma migrate deploy
```

## API 구조

## 주요 기능 구현

## 코딩 컨벤션 및 개발 규칙

### 필수 준수 사항 (MUST)

#### 1. 파일 네이밍

- **컴포넌트**: PascalCase (예: `UserProfile.tsx`)
- **유틸리티/훅**: camelCase (예: `useSearchWorkLog.ts`)
- **API Routes**: `route.ts` (Next.js App Router 규칙)
- **타입 파일**: camelCase (예: `user.ts`, `work-log.ts`)

#### 2. 폴더 구조

- `_component/`: 해당 페이지 전용 컴포넌트 (다른 곳에서 재사용 불가)
- `_hooks/`: 해당 페이지 전용 훅
- `(그룹명)/`: Next.js 라우트 그룹 (URL에 포함 안 됨)
- **규칙**: 페이지 전용 컴포넌트는 반드시 `_component` 폴더에, 공통 컴포넌트는 `src/components`에 위치

#### 3. Import 순서

```tsx
// 1. React 관련
import { useState, useEffect } from 'react'

// 2. Next.js 관련
import { useRouter } from 'next/navigation'

// 3. 외부 라이브러리
import { useQuery } from '@tanstack/react-query'

// 4. 내부 절대경로 import (@/ 사용)
import { Button } from '@/components/ui/button'
import { fetchUsers } from '@/lib/api/user-api'

// 5. 타입/인터페이스
import type { User } from '@/types/user'

// 6. 상대경로 import (동일 디렉토리 내부만)
import { MyLocalComponent } from './MyLocalComponent'
```

#### 4. TypeScript 규칙

- **any 금지**: `any` 타입 절대 사용 금지, `unknown` 사용
- **타입 정의**: API 응답, 컴포넌트 Props는 반드시 타입 정의
- **인터페이스 네이밍**: Props는 `interface [ComponentName]Props` 형식
- **Enum vs Union**: 상수는 Union Type 사용 (예: `type Role = 'ADMIN' | 'WORKER'`)

```tsx
// ✅ 올바른 예시
interface UserProfileProps {
  userId: string
  onUpdate?: () => void
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // ...
}

// ❌ 잘못된 예시
export function UserProfile(props: any) {
  // ...
}
```

#### 5. 컴포넌트 작성 규칙

```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface ComponentNameProps {
  id: string
  title: string
}

// 3. Component (named export 사용)
export function ComponentName({ id, title }: ComponentNameProps) {
  // 4. Hooks (순서: useState → useEffect → useQuery → 커스텀 훅)
  const [isOpen, setIsOpen] = useState(false)

  // 5. useQuery/useMutation
  const { data, isLoading } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData,
  })

  // 6. Event Handlers (handle + 동사 형식)
  const handleClick = () => {
    setIsOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // ...
  }

  // 7. Early Return (로딩, 에러 처리)
  if (isLoading) return <div>Loading...</div>
  if (!data) return null

  // 8. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  )
}
```

#### 6. API Routes 작성 규칙

```tsx
// src/app/api/[resource]/route.ts
import { NextRequest } from 'next/server'
import { apiHandler } from '@/lib/core/api-handler'
import { prisma } from '@/lib/core/prisma'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

// ✅ 반드시 apiHandler로 감싸기
export const GET = apiHandler(
  async (req: NextRequest) => {
    // 1. 세션 체크는 apiHandler가 자동 처리

    // 2. 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    // 3. 데이터 조회
    const data = await prisma.user.findMany()

    // 4. ApiResponseFactory로 응답 반환
    return ApiResponseFactory.success(data)
  },
  {
    requiredRole: 'ADMIN', // 권한 필요시
  },
)

// POST 예시
export const POST = apiHandler(async (req: NextRequest) => {
  // 1. Body 파싱
  const body = await req.json()

  // 2. 유효성 검사
  if (!body.name) {
    return ApiResponseFactory.error('이름은 필수입니다', 400)
  }

  // 3. DB 작업
  const user = await prisma.user.create({
    data: body,
  })

  return ApiResponseFactory.success(user, 201)
})
```

#### 7. Tanstack Query 사용 규칙

```tsx
// ✅ 올바른 패턴
// 1. API 클라이언트 함수 (lib/api/)
export async function fetchUsers() {
  const res = await apiFetch('/api/users')
  return res.json()
}

// 2. 컴포넌트에서 사용
const { data, isLoading, error } = useQuery({
  queryKey: ['users'], // 배열 형식
  queryFn: fetchUsers,
})

// 3. Mutation
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

### 금지 사항 (DON'T)

#### 절대 하지 말 것

1. **직접 fetch 금지**: 반드시 `apiFetch` 사용 (세션 체크 포함)

```tsx
// ❌ 절대 금지
const res = await fetch('/api/users')

// ✅ 올바른 방법
const res = await apiFetch('/api/users')
```

2. **Prisma Client 직접 생성 금지**: 반드시 `@/lib/core/prisma`에서 import

```tsx
// ❌ 절대 금지
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ✅ 올바른 방법
import { prisma } from '@/lib/core/prisma'
```

3. **console.log 커밋 금지**: 디버깅 후 반드시 제거

4. **하드코딩 금지**: 상수는 `lib/constants/`에 정의

```tsx
// ❌ 금지
if (user.role === 'ADMIN') {
}

// ✅ 올바른 방법
import { ROLES } from '@/lib/constants/roles'
if (user.role === ROLES.ADMIN) {
}
```

5. **인라인 스타일 금지**: Tailwind CSS 클래스 사용

```tsx
// ❌ 금지
<div style={{ color: 'red' }}>Text</div>

// ✅ 올바른 방법
<div className="text-red-500">Text</div>
```

6. **올바른 cn import 경로**

```tsx
import { cn } from '@/lib/utils/cn'
```

7. **🚨 운영 환경 DB 작업 절대 금지 🚨**

   **운영 환경의 데이터베이스 스키마, 데이터, 설정을 절대로 직접 조작하지 마세요.**

   ```bash
   # ❌ 절대 금지 - 운영 DB 관련 작업
   npm run db:prod              # 운영 Prisma Studio
   npm run db:sync:prod         # 운영 스키마 동기화
   npm run db:reset:prod        # 운영 DB 초기화
   npm run dev:prod             # 운영 환경으로 개발

   # ❌ 절대 금지 - 운영 DB에 직접 연결
   psql $PRODUCTION_DATABASE_URL

   # ❌ 절대 금지 - 운영 환경 변수 사용
   NODE_ENV=production npm run db:push
   dotenv -e .env.production -- [any db command]
   ```

   **운영 환경 작업 원칙:**
   - 스키마 변경은 **반드시 로컬/개발 환경에서 먼저 테스트**
   - 운영 배포는 **Git을 통한 자동 배포만 사용** (Vercel)
   - 긴급 상황에도 **사용자와 먼저 상의**
   - 데이터 마이그레이션은 **백업 후 승인 받고 진행**

### 선호 패턴 (PREFER)

#### 1. 에러 처리

```tsx
// API Routes
try {
  const data = await someAsyncOperation()
  return ApiResponseFactory.success(data)
} catch (error) {
  console.error('Error:', error)
  return ApiResponseFactory.error('작업 처리 중 오류가 발생했습니다')
}

// 컴포넌트
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
})

if (error) return <div>오류가 발생했습니다</div>
```

#### 2. 조건부 렌더링

```tsx
// ✅ Early Return 선호
if (isLoading) return <Loading />
if (error) return <Error />
if (!data) return null

return <Content data={data} />

// ❌ 중첩 피하기
return <>{isLoading ? <Loading /> : error ? <Error /> : data ? <Content data={data} /> : null}</>
```

#### 3. 상태 관리

- **서버 상태**: Tanstack Query 사용 (API 데이터)
- **클라이언트 상태**: useState 사용 (UI 상태)
- **전역 상태**: Context API 사용 (테마, 인증 등)

#### 4. 날짜/시간 처리

```tsx
// ✅ date-fns 사용
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const kstDate = toZonedTime(new Date(), 'Asia/Seoul')
const formatted = format(kstDate, 'yyyy-MM-dd HH:mm:ss')

// ❌ new Date() 직접 사용 지양
```

#### 5. 컴포넌트 재사용

- 3번 이상 사용되는 코드는 컴포넌트/함수로 분리
- 페이지 전용은 `_component/`, 공통은 `components/`

### 주석 작성 규칙

```tsx
// ✅ 좋은 주석: 왜(Why)를 설명
// 교대조 변경 시 24시간 이내 수정 불가 (정책)
const canEdit = diffInHours < 24

// ❌ 나쁜 주석: 무엇(What)을 반복
// 시간 차이를 24와 비교
const canEdit = diffInHours < 24

// API 함수에는 JSDoc 작성
/**
 * 사용자 목록을 조회합니다.
 * @param includeInactive - 비활성 사용자 포함 여부
 * @returns 사용자 배열
 */
export async function fetchUsers(includeInactive = false) {
  // ...
}
```

### 성능 최적화 규칙

1. **이미지 최적화**: Next.js Image 컴포넌트 사용
2. **동적 Import**: 큰 컴포넌트는 dynamic import

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

3. **메모이제이션**: 불필요한 리렌더링 방지

```tsx
import { memo, useMemo, useCallback } from 'react';

// 컴포넌트 메모이제이션
export const MyComponent = memo(function MyComponent({ data }) {
  // 비싼 계산
  const processedData = useMemo(() => {
    return data.map(item => /* 복잡한 처리 */);
  }, [data]);

  // 콜백 메모이제이션
  const handleClick = useCallback(() => {
    // ...
  }, []);

  return <div>{/* ... */}</div>;
});
```

## 주요 유틸리티

### Time Utils (`lib/utils/time.ts`)

- 날짜/시간 포맷팅
- 한국 시간대(KST) 처리

### Role Utils (`lib/utils/role.ts`)

- 권한 체크 함수

### API Fetch (`lib/api/api-fetch.ts`)

- 공통 fetch 래퍼
- 에러 처리
- 세션 체크

## Supabase 활용

### Storage

- 면허증 이미지 저장
- Public bucket 사용
- 서명된 URL로 보안 처리

### Realtime

- 실시간 공장 현황 업데이트

### Authentication

- Supabase Auth 기반 사용자 인증
- 초기 비밀번호: 사번과 동일
- 최초 로그인 시 비밀번호 변경 필수 (`mustChangePassword` 플래그)

## 🔐 Supabase Auth + RLS 보안 정책

### 기본 원칙

**✅ 모니터링은 공개 READ, 관리는 인증 WRITE, 충돌과 협업은 Realtime으로 제어**

### 1. 인증 구조

#### 사용자 등록

- Supabase Auth에 임시 이메일 형식으로 등록: `{userId}@temp.invalid`
- 초기 비밀번호는 사번과 동일
- Prisma DB에 사용자 정보 저장 (role, mustChangePassword 등)

#### 로그인 플로우

1. 사번으로 로그인 (내부적으로 `{userId}@temp.invalid` 이메일로 변환)
2. 최초 로그인 시 비밀번호 변경 페이지로 자동 리디렉션
3. 비밀번호 변경 전에는 다른 페이지 접근 불가 (레이아웃 레벨에서 체크)
4. 비밀번호 변경 후 자동 재로그인 처리

### 2. Row Level Security (RLS) 정책

#### RLS 활성화 테이블

```sql
-- 모든 테이블 RLS 활성화
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."work_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."factory_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."factory_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."line_shifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."process_slots" ENABLE ROW LEVEL SECURITY;
```

#### RLS 정책 원칙

- **로그인 여부만 구분** (`anon` / `authenticated`)
- **role 기반 분기는 RLS에서 하지 않음** ❌
- role 체크는 API 레벨에서 수행

#### 정책 설정

**users 테이블**: authenticated만 접근

```sql
CREATE POLICY "users_authenticated_all" ON "public"."users"
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

**공정 관련 테이블**: 읽기는 누구나(모니터용), 쓰기는 authenticated만

```sql
-- 예시: work_classes
CREATE POLICY "work_classes_read_all" ON "public"."work_classes"
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "work_classes_write_authenticated" ON "public"."work_classes"
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### 3. 코드 레벨 접근 제어

#### ✅ 관리자 API (Prisma 사용)

```typescript
// Prisma는 SERVICE_ROLE_KEY 사용하므로 RLS 우회
// 반드시 API 레벨에서 인증 체크 필요

// src/app/api/factory-line/route.ts
export const POST = apiHandler(async (req: NextRequest) => {
  // Prisma로 데이터 작업
  const line = await prisma.factoryLine.create({ ... })
  return ApiResponseFactory.success(line)
}, {
  requiredRole: 'ADMIN' // 인증 + role 체크
})
```

#### ✅ 모니터 페이지 (Supabase Client 직접 사용)

```typescript
// src/app/monitor/page.tsx
// RLS 정책이 자동 적용되는 Supabase Client 사용
const supabase = createClient(...)
const { data } = await supabase
  .from('factory_lines')
  .select('*')
// 로그인 없이도 조회 가능 (RLS에서 anon 허용)
```

#### ❌ 금지 사항

```typescript
// ❌ 모니터용 API에서 Prisma 사용 금지
export const GET = async () => {
  const data = await prisma.factoryLine.findMany() // ❌ RLS 우회됨
  return NextResponse.json(data)
}

// ❌ RLS 정책에서 role 체크 금지
CREATE POLICY "admin_only" ON factory_lines
  USING (auth.jwt() ->> 'role' = 'ADMIN'); // ❌

// ❌ 관리자 API에서 인증 생략 금지
export const PUT = async (req) => {
  await prisma.factoryLine.update({ ... }) // ❌ 인증 체크 없음
  return NextResponse.json({ success: true })
}
```

### 4. 동시 수정 충돌 방지

#### 낙관적 잠금 (Optimistic Locking)

**스키마 변경:**

```prisma
model FactoryLine {
  id              String   @id @default(cuid())
  name            String
  displayOrder    Int

  // 낙관적 잠금용
  version         Int      @default(0)

  // 감사 추적용
  updatedBy       String?  // 수정한 사용자 ID
  updatedAt       DateTime @default(now()) @updatedAt
}
```

**API 구현:**

```typescript
export const PUT = apiHandler(
  async (req, { params }) => {
    const { version, ...updateData } = await req.json()
    const session = await getSessionUser(req)

    // 현재 버전 확인
    const current = await prisma.factoryLine.findUnique({
      where: { id: params.id },
    })

    if (current.version !== version) {
      throw new ApiError('다른 관리자가 먼저 수정했습니다. 페이지를 새로고침하세요.', 409)
    }

    // 버전 증가하며 업데이트
    const updated = await prisma.factoryLine.update({
      where: { id: params.id, version },
      data: {
        ...updateData,
        version: { increment: 1 },
        updatedBy: session.userId,
      },
    })

    return ApiResponseFactory.success(updated)
  },
  { requiredRole: 'ADMIN' },
)
```

#### Realtime 편집 상태 표시 (선택적)

```typescript
// 관리자 화면에서 Supabase Realtime 사용
const channel = supabase.channel('factory-editing')

// 편집 시작 브로드캐스트
channel.send({
  type: 'broadcast',
  event: 'editing-start',
  payload: {
    resource: 'factory_line',
    resource_id: lineId,
    user_name: session.name,
  },
})

// 다른 관리자 편집 중 표시
channel.on('broadcast', { event: 'editing-start' }, (payload) => {
  if (payload.resource_id === currentLineId) {
    showWarning(`${payload.user_name}님이 편집 중입니다`)
  }
})
```

### 5. 체크리스트

#### Phase 1: RLS 설정 (최우선)

- [ ] Supabase Dashboard에서 모든 테이블 RLS 활성화
- [ ] users 테이블: authenticated 전용 정책 생성
- [ ] 공정 테이블들: SELECT는 anon+authenticated, 쓰기는 authenticated만
- [ ] 정책에서 role 분기 하지 않기

#### Phase 2: 코드 정리

- [ ] 모니터 페이지: Supabase Client로 변경 (Prisma 제거)
- [ ] 관리자 API: Prisma 유지 + 인증 체크 확인
- [ ] 모든 쓰기 API에 `requiredRole` 옵션 적용 확인

#### Phase 3: 동시 수정 방지

- [ ] 수정 가능 테이블에 `version`, `updatedBy`, `updatedAt` 추가
- [ ] PUT API에 낙관적 잠금 로직 구현
- [ ] 409 Conflict 에러 처리 및 사용자 안내

#### Phase 4: Realtime (선택)

- [ ] Supabase Realtime 채널 구성
- [ ] 편집 시작/종료 이벤트 브로드캐스트
- [ ] UI에 편집 중인 사용자 표시

### 6. 작업 우선순위

| Phase | 작업        | 우선순위   |
| ----- | ----------- | ---------- |
| 1     | RLS 설정    | ⭐⭐⭐⭐⭐ |
| 2     | 코드 정리   | ⭐⭐⭐⭐   |
| 3     | 낙관적 잠금 | ⭐⭐⭐⭐   |
| 4     | Realtime    | ⭐⭐⭐     |

### 7. 주의사항

- **Prisma는 SERVICE_ROLE_KEY로 동작**하므로 RLS를 우회합니다
- 따라서 Prisma를 사용하는 모든 API는 **반드시 인증 체크**가 필요합니다
- 모니터 화면은 로그인 없이 접근 가능해야 하므로 **Supabase Client 직접 사용** 권장
- RLS 정책은 **로그인 여부만 체크**하고, role 분기는 **API 레벨에서 처리**
- 비밀번호 변경 시 **자동 재로그인** 처리로 세션 무효화 문제 해결

## 배포

### Vercel 배포

- GitHub 연동 자동 배포
- 환경 변수는 Vercel Dashboard에서 설정

### 환경 변수

```
DATABASE_URL=              # PostgreSQL 연결 문자열
NEXT_PUBLIC_SUPABASE_URL=  # Supabase 프로젝트 URL
SUPABASE_SERVICE_ROLE_KEY= # Supabase 서비스 키
SESSION_SECRET=            # iron-session 암호화 키
```

## Keep-Alive

Supabase Free 플랜은 비활성 시 DB가 일시 중지되므로, cron job을 통해 주기적으로 keep-alive 요청을 보냅니다.

- API: `GET /api/keep-alive`
- Vercel Cron: 매 10분마다 실행 (`vercel.json`)

## 문서

- [사용 가이드 문서](https://kkomyoung.notion.site/27e8e4df974d807c8165fe913cdd000b)
- [테스트 문서](https://kkomyoung.notion.site/27e8e4df974d80b38ed1e679ec2f45ef)
- [와이어프레임](https://www.figma.com/design/En44a0DuQjNLszsK5Sa2n1/SL%EB%AF%B8%EB%9F%AC%ED%85%8D-%EC%99%80%EC%9D%B4%EC%96%B4%ED%94%84%EB%A0%88%EC%9E%84)

## 개발 팁

### 1. Prisma Studio로 데이터 확인

```bash
npm run db        # 로컬
npm run db:dev    # 개발
npm run db:prod   # 운영 (주의!)
```

### 2. 타입 안전성

- Prisma Client는 자동으로 타입 생성
- API 응답 타입은 `src/types/` 에 정의

### 4. Tailwind CSS

- `tw-animate-css` 플러그인 사용
- 커스텀 컴포넌트는 `components/ui/`
- shadcn/ui 기반
