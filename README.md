# SL미러텍 작업장 현황 관리 시스템 🏭

> 작업자 배치와 공정 관리를 실시간으로 관리하는 공장 관리 웹 시스템

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [빠른 시작](#빠른-시작)
- [환경 설정](#환경-설정)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [개발 가이드](#개발-가이드)
- [배포](#배포)
- [문서](#문서)

## 프로젝트 소개

기존 칠판과 엑셀로 관리하던 작업자/공정 관리를 디지털화한 웹 기반 공장 관리 시스템입니다.

### 주요 모드

- **관리자 모드**: 작업장/작업자 관리 (PC/Mobile 반응형)
- **모니터 모드**: 로그인 없이 공장 현황 실시간 조회 (대형 TV 최적화)

## 빠른 시작

### 1. 필수 설치 프로그램

- Node.js 20 이상
- npm 또는 yarn
- Docker (로컬 개발용 PostgreSQL)

### 2. 프로젝트 설치

```bash
# 저장소 클론
git clone <repository-url>
cd sl-worklog-web

# 의존성 설치
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 아래 내용을 입력하세요:

```env
# Database (로컬 개발)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/factory_db?schema=public"

# Supabase (개발/운영 환경에서 사용)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Session
SESSION_SECRET="your-session-secret-min-32-chars"
```

> 개발/운영 환경 설정은 `.env.development`, `.env.production` 파일에 별도로 설정합니다.

### 4. 데이터베이스 설정

```bash
# Docker로 PostgreSQL 실행
docker-compose up -d

# Prisma 스키마 동기화
npm run db:sync

# 초기 데이터 생성 (선택)
npm run db:seed
```

### 5. 개발 서버 실행

```bash
# 로컬 환경으로 실행
npm run dev:local

# 개발 환경으로 실행
npm run dev:dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 6. 초기 로그인

- **사번**: 시드 데이터에서 생성된 관리자 계정 사용
- **비밀번호**: 초기 비밀번호는 사번과 동일
- 최초 로그인 시 비밀번호 변경 필수

## 환경 설정

### 환경별 명령어

이 프로젝트는 3가지 환경을 지원합니다:

| 환경       | 설정 파일            | 데이터베이스        |
| ---------- | -------------------- | ------------------- |
| local      | `.env.local`         | Docker PostgreSQL   |
| development | `.env.development`   | Supabase (개발)     |
| production | `.env.production`    | Supabase (운영)     |

```bash
# 개발 서버
npm run dev:local      # 로컬
npm run dev:dev        # 개발
npm run dev:prod       # 운영 (⚠️ 주의!)

# 빌드
npm run build:local
npm run build:dev
npm run build:prod

# 데이터베이스 관리
npm run db             # Prisma Studio (로컬)
npm run db:dev         # Prisma Studio (개발)
npm run db:sync        # 스키마 동기화 (로컬)
npm run db:sync:dev    # 스키마 동기화 (개발)
npm run db:seed        # 시드 데이터 입력 (로컬)
```

### ⚠️ 중요: 운영 환경 보호

**절대로 운영 DB에 직접 작업하지 마세요!**

```bash
# ❌ 절대 금지
npm run db:prod              # 운영 DB 직접 접근
npm run db:sync:prod         # 운영 스키마 직접 수정
npm run db:reset:prod        # 운영 DB 초기화
```

- 스키마 변경은 로컬/개발 환경에서 먼저 테스트
- 운영 배포는 Git을 통한 자동 배포만 사용 (Vercel)

## 주요 기능

### 관리자 모드

- **작업장 현황**: 라인별 상태 관리, 작업자 배치
- **작업장 관리**: 라인, 공정 설정
- **작업자 관리**: 사용자 등록/수정/삭제, 교육 이력, 공정 면허증 관리

### 모니터 모드

- 로그인 없이 실시간 공장 현황 조회
- 대형 TV 최적화된 UI

## 기술 스택

### Frontend

- **Framework**: Next.js 15.5 (App Router)
- **UI**: React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui
- **State**: Tanstack Query v5

### Backend

- **API**: Next.js API Routes
- **ORM**: Prisma 6.15
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth

### Infrastructure

- **Hosting**: Vercel
- **Database**: Supabase

## 개발 가이드

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (admin)/           # 관리자 모드 (로그인 필요)
│   ├── (monitor)/         # 모니터 모드 (공개)
│   └── api/               # API Routes
├── components/            # 공통 컴포넌트
│   └── ui/               # shadcn/ui 컴포넌트
├── lib/
│   ├── api/              # API 클라이언트 함수
│   ├── core/             # 핵심 유틸 (prisma, api-handler 등)
│   ├── constants/        # 상수 정의
│   └── utils/            # 유틸리티 함수
├── types/                # TypeScript 타입 정의
prisma/
├── schema.prisma         # 데이터베이스 스키마
└── seed/                 # 시드 데이터
```

### 주요 개발 규칙

#### 1. 파일 네이밍

- 컴포넌트: `PascalCase.tsx`
- 유틸/훅: `camelCase.ts`
- API: `route.ts`

#### 2. Import 순서

```tsx
// 1. React
import { useState } from 'react'
// 2. Next.js
import { useRouter } from 'next/navigation'
// 3. 외부 라이브러리
import { useQuery } from '@tanstack/react-query'
// 4. 내부 절대경로 (@/)
import { Button } from '@/components/ui/button'
// 5. 타입
import type { User } from '@/types/user'
// 6. 상대경로
import { MyComponent } from './MyComponent'
```

#### 3. API 작성 규칙

```typescript
// src/app/api/users/route.ts
import { apiHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { prisma } from '@/lib/core/prisma'

export const GET = apiHandler(async (req) => {
  const users = await prisma.user.findMany()
  return ApiResponseFactory.success(users)
}, {
  requiredRole: 'ADMIN' // 권한 필요시
})
```

#### 4. 금지 사항

- ❌ `any` 타입 사용 금지
- ❌ `fetch` 직접 사용 금지 (→ `apiFetch` 사용)
- ❌ Prisma Client 직접 생성 금지 (→ `@/lib/core/prisma` 사용)
- ❌ `console.log` 커밋 금지

### 유용한 명령어

```bash
# 코드 품질
npm run lint              # ESLint 검사
npm run lint:fix          # ESLint 자동 수정
npm run format            # Prettier 포맷팅
npm run format:check      # Prettier 검사

# 데이터베이스
npm run db                # Prisma Studio 열기
npm run db:sync           # 스키마 동기화
npm run db:seed           # 시드 데이터 입력
```

## 배포

### Vercel 배포

1. GitHub에 푸시
2. Vercel에서 자동 배포 트리거
3. 환경 변수는 Vercel Dashboard에서 설정

### 필수 환경 변수

```env
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
```

## 문서

- [상세 개발 가이드](.claude/CLAUDE.md) - 코딩 컨벤션 및 아키텍처
- [사용 가이드](https://kkomyoung.notion.site/27e8e4df974d807c8165fe913cdd000b)
- [테스트 문서](https://kkomyoung.notion.site/27e8e4df974d80b38ed1e679ec2f45ef)
- [와이어프레임](https://www.figma.com/design/En44a0DuQjNLszsK5Sa2n1/SL%EB%AF%B8%EB%9F%AC%ED%85%8D-%EC%99%80%EC%9D%B4%EC%96%B4%ED%94%84%EB%A0%88%EC%9E%84)

## 문제 해결

### Docker가 실행되지 않아요

```bash
# Docker 상태 확인
docker ps

# Docker Compose 재시작
docker-compose down
docker-compose up -d
```

### Prisma 스키마 동기화 오류

```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 스키마 강제 푸시 (개발 환경만)
npm run db:sync
```

### 환경 변수가 인식 안 돼요

- `.env.local` 파일 위치 확인 (프로젝트 루트)
- 개발 서버 재시작 필요
- `NEXT_PUBLIC_` 접두사는 클라이언트에서만 접근 가능

## 라이센스

Private - SL미러텍 내부 사용

