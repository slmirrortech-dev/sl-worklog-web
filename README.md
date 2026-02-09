# SL미러텍 작업장 현황 관리 시스템

작업자 배치와 공정 관리를 실시간으로 관리하는 공장 관리 웹 시스템

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Hosting | Vercel |

## 환경별 설정

| 환경 | 설정 파일 | 용도 |
|------|-----------|------|
| local | `.env.local` | 로컬 개발 (Docker + Supabase Local) |
| production | `.env.production` | 운영 (Supabase Cloud + Vercel) |

## 로컬 개발 시작

```bash
# 1. Supabase 로컬 실행
supabase start

# 2. 의존성 설치
npm install

# 3. DB 스키마 동기화
npm run db:sync

# 4. 시드 데이터 (초기 관리자 생성)
npm run db:seed

# 5. 개발 서버 실행
npm run dev:local
```

**로컬 접속 정보:**
- 앱: http://localhost:3000
- Supabase Studio: http://127.0.0.1:54323

## 주요 명령어

```bash
# 개발 서버
npm run dev:local          # 로컬 환경
npm run dev:prod           # 운영 환경 (주의!)

# DB 관리
npm run db                 # Prisma Studio (로컬)
npm run db:sync            # 스키마 동기화 (로컬)
npm run db:sync:prod       # 스키마 동기화 (운영)
npm run db:seed            # 시드 데이터 (로컬)
npm run db:seed:prod       # 시드 데이터 (운영)

# 코드 품질
npm run lint:fix           # ESLint 자동 수정
npm run format             # Prettier 포맷팅
```

## Supabase SQL 설정 파일

새 Supabase 프로젝트 설정 시 SQL Editor에서 실행해야 하는 파일들:

| 파일 | 용도 | 실행 시점 |
|------|------|-----------|
| `prisma/setup-rls.sql` | Row Level Security 정책 설정 | 최초 1회 |
| `prisma/setup-backup-trigger.sql` | 자동 백업 Trigger 설정 (UI에서 백업 시간 변경 시 자동 반영) | 최초 1회 |
| `prisma/enable-realtime.sql` | Supabase Realtime 활성화 | 최초 1회 |

> `setup-backup-trigger.sql` 실행 전 `api_url`과 `cron_secret` 값을 수정하세요.

## Vercel 환경 변수

| 변수명 | 설명 |
|--------|------|
| `DATABASE_URL` | Supabase DB 연결 (pooler, 포트 6543) |
| `DIRECT_URL` | Supabase DB 직접 연결 (포트 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `CRON_SECRET` | 자동 백업 API 인증 키 |

## 초기 관리자 계정

시드 데이터로 생성되는 계정 (환경변수 `INITIAL_ADMIN_PASSWORD` 참조):
- 사번: `master`
- 비밀번호: 환경변수에 설정된 값

## 프로젝트 구조

```
src/
├── app/
│   ├── (admin)/        # 관리자 모드 (로그인 필요)
│   ├── (monitor)/      # 모니터 모드 (공개)
│   └── api/            # API Routes
├── components/ui/      # shadcn/ui 컴포넌트
├── lib/
│   ├── api/            # API 클라이언트
│   ├── core/           # prisma, api-handler 등
│   └── utils/          # 유틸리티
└── types/              # TypeScript 타입

prisma/
├── schema.prisma       # DB 스키마
├── seed/               # 시드 데이터
├── setup-rls.sql       # RLS 설정
├── setup-backup-trigger.sql  # 자동 백업 Trigger
└── enable-realtime.sql # Realtime 설정
```

## 문서

- [코딩 컨벤션 및 아키텍처](.claude/CLAUDE.md)
- [사용 가이드](https://kkomyoung.notion.site/27e8e4df974d807c8165fe913cdd000b)