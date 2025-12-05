# SL미러텍 공장 관리 시스템 🏭

## 프로젝트 개요

SL미러텍의 작업자 배치와 공정 관리를 디지털화한 웹 기반 공장 관리 시스템입니다.
기존 칠판과 엑셀로 관리하던 작업자/공정 관리를 실시간으로 관리하고 공유할 수 있도록 개발되었습니다.

### 주요 모드

1. **관리자 모드** (PC/Mobile 반응형)
   - 작업장 현황 : 라인별 상태 관리, 작업자 배치 관리
   - 작업장 관리 : 라인, 공정 설정 (진입 시 작업장 현황 Lock)
   - 작업자 관리 : 관리자, 작업반장, 작업자 등록/수정/삭제, 교육 이력, 불량 발생 여부, 공정면허증 관리

3. **모니터 모드** (대형 TV 최적화)
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
import { useState, useEffect } from 'react';

// 2. Next.js 관련
import { useRouter } from 'next/navigation';

// 3. 외부 라이브러리
import { useQuery } from '@tanstack/react-query';

// 4. 내부 절대경로 import (@/ 사용)
import { Button } from '@/components/ui/button';
import { fetchUsers } from '@/lib/api/user-api';

// 5. 타입/인터페이스
import type { User } from '@/types/user';

// 6. 상대경로 import (동일 디렉토리 내부만)
import { MyLocalComponent } from './MyLocalComponent';
```

#### 4. TypeScript 규칙
- **any 금지**: `any` 타입 절대 사용 금지, `unknown` 사용
- **타입 정의**: API 응답, 컴포넌트 Props는 반드시 타입 정의
- **인터페이스 네이밍**: Props는 `interface [ComponentName]Props` 형식
- **Enum vs Union**: 상수는 Union Type 사용 (예: `type Role = 'ADMIN' | 'WORKER'`)

```tsx
// ✅ 올바른 예시
interface UserProfileProps {
  userId: string;
  onUpdate?: () => void;
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
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface ComponentNameProps {
  id: string;
  title: string;
}

// 3. Component (named export 사용)
export function ComponentName({ id, title }: ComponentNameProps) {
  // 4. Hooks (순서: useState → useEffect → useQuery → 커스텀 훅)
  const [isOpen, setIsOpen] = useState(false);

  // 5. useQuery/useMutation
  const { data, isLoading } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData,
  });

  // 6. Event Handlers (handle + 동사 형식)
  const handleClick = () => {
    setIsOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // ...
  };

  // 7. Early Return (로딩, 에러 처리)
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  // 8. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
}
```

#### 6. API Routes 작성 규칙

```tsx
// src/app/api/[resource]/route.ts
import { NextRequest } from 'next/server';
import { apiHandler } from '@/lib/core/api-handler';
import { prisma } from '@/lib/core/prisma';
import { ApiResponseFactory } from '@/lib/core/api-response-factory';

// ✅ 반드시 apiHandler로 감싸기
export const GET = apiHandler(async (req: NextRequest) => {
  // 1. 세션 체크는 apiHandler가 자동 처리

  // 2. 쿼리 파라미터 파싱
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  // 3. 데이터 조회
  const data = await prisma.user.findMany();

  // 4. ApiResponseFactory로 응답 반환
  return ApiResponseFactory.success(data);
}, {
  requiredRole: 'ADMIN', // 권한 필요시
});

// POST 예시
export const POST = apiHandler(async (req: NextRequest) => {
  // 1. Body 파싱
  const body = await req.json();

  // 2. 유효성 검사
  if (!body.name) {
    return ApiResponseFactory.error('이름은 필수입니다', 400);
  }

  // 3. DB 작업
  const user = await prisma.user.create({
    data: body,
  });

  return ApiResponseFactory.success(user, 201);
});
```

#### 7. Tanstack Query 사용 규칙

```tsx
// ✅ 올바른 패턴
// 1. API 클라이언트 함수 (lib/api/)
export async function fetchUsers() {
  const res = await apiFetch('/api/users');
  return res.json();
}

// 2. 컴포넌트에서 사용
const { data, isLoading, error } = useQuery({
  queryKey: ['users'], // 배열 형식
  queryFn: fetchUsers,
});

// 3. Mutation
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### 금지 사항 (DON'T)

#### 절대 하지 말 것

1. **직접 fetch 금지**: 반드시 `apiFetch` 사용 (세션 체크 포함)
```tsx
// ❌ 절대 금지
const res = await fetch('/api/users');

// ✅ 올바른 방법
const res = await apiFetch('/api/users');
```

2. **Prisma Client 직접 생성 금지**: 반드시 `@/lib/core/prisma`에서 import
```tsx
// ❌ 절대 금지
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ 올바른 방법
import { prisma } from '@/lib/core/prisma';
```

3. **console.log 커밋 금지**: 디버깅 후 반드시 제거

4. **하드코딩 금지**: 상수는 `lib/constants/`에 정의
```tsx
// ❌ 금지
if (user.role === 'ADMIN') { }

// ✅ 올바른 방법
import { ROLES } from '@/lib/constants/roles';
if (user.role === ROLES.ADMIN) { }
```

5. **인라인 스타일 금지**: Tailwind CSS 클래스 사용
```tsx
// ❌ 금지
<div style={{ color: 'red' }}>Text</div>

// ✅ 올바른 방법
<div className="text-red-500">Text</div>
```
6. 올바른 cn import 경로
```tsx
import { cn } from '@/lib/utils/cn'
```


### 선호 패턴 (PREFER)

#### 1. 에러 처리
```tsx
// API Routes
try {
  const data = await someAsyncOperation();
  return ApiResponseFactory.success(data);
} catch (error) {
  console.error('Error:', error);
  return ApiResponseFactory.error('작업 처리 중 오류가 발생했습니다');
}

// 컴포넌트
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

if (error) return <div>오류가 발생했습니다</div>;
```

#### 2. 조건부 렌더링
```tsx
// ✅ Early Return 선호
if (isLoading) return <Loading />;
if (error) return <Error />;
if (!data) return null;

return <Content data={data} />;

// ❌ 중첩 피하기
return (
  <>
    {isLoading ? (
      <Loading />
    ) : error ? (
      <Error />
    ) : data ? (
      <Content data={data} />
    ) : null}
  </>
);
```

#### 3. 상태 관리
- **서버 상태**: Tanstack Query 사용 (API 데이터)
- **클라이언트 상태**: useState 사용 (UI 상태)
- **전역 상태**: Context API 사용 (테마, 인증 등)

#### 4. 날짜/시간 처리
```tsx
// ✅ date-fns 사용
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const kstDate = toZonedTime(new Date(), 'Asia/Seoul');
const formatted = format(kstDate, 'yyyy-MM-dd HH:mm:ss');

// ❌ new Date() 직접 사용 지양
```

#### 5. 컴포넌트 재사용
- 3번 이상 사용되는 코드는 컴포넌트/함수로 분리
- 페이지 전용은 `_component/`, 공통은 `components/`

### 주석 작성 규칙

```tsx
// ✅ 좋은 주석: 왜(Why)를 설명
// 교대조 변경 시 24시간 이내 수정 불가 (정책)
const canEdit = diffInHours < 24;

// ❌ 나쁜 주석: 무엇(What)을 반복
// 시간 차이를 24와 비교
const canEdit = diffInHours < 24;

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
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
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