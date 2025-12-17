# Prisma 및 Supabase 설정 가이드

## 목차
1. [RLS (Row Level Security) 설정](#1-rls-row-level-security-설정)
2. [Realtime 활성화](#2-realtime-활성화)
3. [자동 백업 설정 (pg_cron)](#3-자동-백업-설정-pg_cron)
4. [데이터베이스 마이그레이션](#4-데이터베이스-마이그레이션)
5. [시드 데이터](#5-시드-데이터)
6. [Prisma Studio](#6-prisma-studio)

---

# Prisma 및 Supabase 설정 가이드

## 1. RLS (Row Level Security) 설정

### 목적
- 모니터 화면: 로그인 없이 READ 가능
- 관리자 화면: 로그인 필요, WRITE 가능

### 실행 방법

1. Supabase Dashboard 접속
2. SQL Editor 열기
3. `setup-rls.sql` 파일 내용 복사/붙여넣기
4. Run 클릭

```bash
# 또는 로컬에서 확인
cat prisma/setup-rls.sql
```

## 2. Realtime 활성화

### 문제 증상
콘솔에 다음과 같은 에러가 표시됨:
```
[Realtime] Subscription error: Error: "Unknown Error on Channel"
```

### 원인
Supabase Realtime replication이 활성화되지 않음

### 해결 방법

#### 방법 1: SQL로 활성화 (권장)

1. Supabase Dashboard > SQL Editor
2. `enable-realtime.sql` 파일 내용 실행:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE factory_lines;
ALTER PUBLICATION supabase_realtime ADD TABLE line_shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE process_slots;
```

#### 방법 2: Dashboard에서 수동 활성화

1. Supabase Dashboard 접속
2. Database > Replication 메뉴
3. 다음 테이블들의 "Enable" 버튼 클릭:
   - `factory_lines`
   - `line_shifts`
   - `process_slots`

### 확인 방법

SQL Editor에서 실행:

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

위 3개 테이블이 목록에 있으면 성공!

### 적용 후

브라우저 새로고침 후 콘솔에 다음 메시지가 표시되어야 함:

```
[Realtime] Successfully subscribed to realtime:factory-line
```

## 3. 자동 백업 설정 (pg_cron)

### 목적
- Vercel Free 플랜의 Function Invocation 제한 회피
- Supabase에서 직접 매분마다 백업 시간 체크
- `backup_schedules` 테이블의 시간과 일치하면 자동 백업 실행

### 설정 단계

#### Step 1: CRON_SECRET 생성

랜덤 문자열 생성:
```bash
openssl rand -base64 32
```

출력 예시: `Ab12Cd34Ef56Gh78Ij90Kl12Mn34Op56Qr78St90Uv12Wx34==`

#### Step 2: Vercel 환경 변수 설정

1. Vercel Dashboard > Project Settings > Environment Variables
2. 새 환경 변수 추가:
   - **Name**: `CRON_SECRET`
   - **Value**: (Step 1에서 생성한 값)
   - **Environment**: Production, Preview, Development 모두 선택
3. Save

#### Step 3: Supabase Vault에 Secret 저장 (권장)

Supabase Dashboard > SQL Editor:
```sql
-- Vault에 CRON_SECRET 저장
SELECT vault.create_secret('CRON_SECRET', 'Ab12Cd34Ef56Gh78Ij90Kl12Mn34Op56Qr78St90Uv12Wx34==');
```

> **참고**: Vault를 사용하지 않고 SQL에 직접 하드코딩해도 동작하지만, 보안상 Vault 사용을 권장합니다.

#### Step 4: Supabase pg_cron 설정

1. Supabase Dashboard > SQL Editor
2. `prisma/setup-pg-cron.sql` 파일 열기
3. 다음 값을 실제 값으로 수정:
   ```sql
   -- 실제 Vercel 배포 URL로 변경
   api_url TEXT := 'https://your-project.vercel.app/api/cron/backup-workplace';

   -- Option A: 하드코딩 (간단하지만 보안 취약)
   cron_secret TEXT := 'YOUR_CRON_SECRET_HERE';

   -- Option B: Vault 사용 (권장)
   -- cron_secret TEXT := vault.get_secret('CRON_SECRET');
   ```
4. 전체 SQL 실행

#### Step 5: 백업 시간 등록

SQL Editor에서 실행:
```sql
-- 매일 저녁 6시 40분에 백업
INSERT INTO backup_schedules (id, time)
VALUES (gen_random_uuid()::text, '18:40');

-- 추가 시간대 설정 가능 (예: 오전 6시)
INSERT INTO backup_schedules (id, time)
VALUES (gen_random_uuid()::text, '06:00');
```

### 확인 방법

#### Cron Job 등록 확인
```sql
SELECT * FROM cron.job;
```

예상 결과:
```
jobname                | schedule   | active
-----------------------|------------|--------
backup-workplace-auto  | * * * * *  | t
```

#### 실행 로그 확인
```sql
SELECT
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'backup-workplace-auto')
ORDER BY start_time DESC
LIMIT 10;
```

### 동작 방식

```
매분마다:
  ┌─────────────────────────────────────────┐
  │ 1. Supabase pg_cron 실행                │
  └──────────────┬──────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────┐
  │ 2. pg_net으로 Vercel API 호출           │
  │    POST /api/cron/backup-workplace      │
  │    Header: Authorization: Bearer SECRET │
  └──────────────┬──────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────┐
  │ 3. API: 현재 시간(KST) 확인             │
  │    예: 18:40                            │
  └──────────────┬──────────────────────────┘
                 │
                 ▼
  ┌─────────────────────────────────────────┐
  │ 4. backup_schedules 테이블 조회         │
  │    시간 일치 여부 확인                  │
  └──────────────┬──────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
  일치 O                일치 X
  백업 실행             즉시 종료
```

### 문제 해결

#### Cron이 실행되지 않는 경우

1. Extension 활성화 확인:
```sql
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
```

2. Cron Job 활성화 확인:
```sql
SELECT jobname, active FROM cron.job;
```

3. 에러 로그 확인:
```sql
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

#### API 호출은 되는데 백업이 안 되는 경우

1. Vercel Logs 확인
2. `backup_schedules` 테이블에 시간 등록 확인:
```sql
SELECT * FROM backup_schedules;
```
3. API 응답 확인 (Vercel Logs):
```json
{
  "ok": true,
  "message": "백업 시간이 아님",
  "currentTime": "18:39",
  "schedules": ["18:40"]
}
```

### Cron 삭제 (필요시)

```sql
SELECT cron.unschedule('backup-workplace-auto');
```

## 4. 데이터베이스 마이그레이션

### 로컬 개발

```bash
# 스키마 변경 후 마이그레이션 생성
npm run db:migrate

# 로컬 DB에 적용
npm run db:sync
```

### 개발/운영 환경

```bash
# 개발 환경에 마이그레이션 적용
npm run db:sync:dev

# ⚠️ 운영 환경 (주의!)
npm run db:sync:prod
```

## 4. 시드 데이터

```bash
# 초기 데이터 입력
npm run db:seed
```

## 5. Prisma Studio

```bash
# 로컬
npm run db

# 개발
npm run db:dev

# 운영 (주의!)
npm run db:prod
```

## 주의사항

⚠️ **운영 환경 작업 시 반드시 백업 후 진행**

- RLS 설정: 운영 환경에 먼저 테스트 필요
- Realtime 활성화: 무중단으로 적용 가능
- 마이그레이션: 반드시 로컬/개발에서 테스트 후 운영 적용
