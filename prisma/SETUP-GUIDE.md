# 🚀 자동 백업 시스템 설정 가이드

## 📋 요구사항

**관리자는 SQL을 모름 → UI에서만 백업 시간 관리**

✅ 해결 방법: **Trigger 자동화**

## 🔄 전체 동작 흐름

```
┌─────────────────────────────────────┐
│ 1. 관리자 UI에서 시간 변경          │
│    (예: 18:40 추가)                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. API 호출                         │
│    PUT /api/backup-schedule         │
│    Body: { times: ["18:40"] }      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. backup_schedules 테이블 변경     │
│    INSERT/UPDATE/DELETE             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 4. 🔥 Trigger 자동 실행             │
│    refresh_backup_cron_jobs()       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 5. Cron Job 재생성                  │
│    - 기존 job 삭제                  │
│    - KST → UTC 변환                 │
│    - pg_cron 등록                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 6. 매일 18:40(KST)에 자동 백업     │
│    pg_cron → pg_net → Vercel API   │
└─────────────────────────────────────┘
```

---

## 🛠️ 1회 설정 (Supabase)

### Step 1: CRON_SECRET 생성

```bash
openssl rand -base64 32
```

출력 예시: `Ab12Cd34Ef56Gh78Ij90Kl12Mn34Op56Qr78St90Uv12Wx34==`

**이 값을 복사해두세요!**

---

### Step 2: Vercel 환경 변수 설정

1. https://vercel.com/dashboard
2. 프로젝트 선택
3. **Settings** > **Environment Variables**
4. 새 변수 추가:
   - **Name**: `CRON_SECRET`
   - **Value**: (Step 1에서 생성한 값)
   - **Environment**: Production 선택
5. **Save** 클릭

---

### Step 3: Supabase Trigger 설정

1. https://supabase.com/dashboard
2. 프로젝트 선택
3. **SQL Editor** 클릭
4. `prisma/setup-backup-trigger.sql` 파일 내용 복사
5. **60번 줄** 수정:
   ```sql
   cron_secret TEXT := 'YOUR_CRON_SECRET_HERE';
   ```
   → Step 1에서 생성한 값으로 변경

6. **Run** 버튼 클릭

**예상 출력:**
```
=== 기존 cron job 삭제 시작 ===
=== 새 cron job 생성 시작 ===
=== 모든 cron job 생성 완료 ===
총 0 개의 스케줄이 등록되었습니다.
```

---

### Step 4: 확인

Supabase SQL Editor에서 실행:
```sql
-- Trigger 확인
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'backup_schedule_auto_refresh';

-- Cron Job 확인
SELECT * FROM cron.job WHERE jobname LIKE 'backup-%';
```

**예상 결과:**
```
trigger_name                  | event_manipulation | event_object_table
------------------------------|-------------------|-------------------
backup_schedule_auto_refresh  | INSERT            | backup_schedules
backup_schedule_auto_refresh  | UPDATE            | backup_schedules
backup_schedule_auto_refresh  | DELETE            | backup_schedules
```

---

## 🎨 UI에서 백업 시간 관리

### 관리자 페이지에서:

1. **백업 설정** 메뉴 진입
2. 백업 시간 입력 (예: `18:40`)
3. **저장** 버튼 클릭
4. 🎉 **자동으로 cron job 재생성됨!**

### API 직접 호출 (개발자용):

```bash
# 백업 시간 조회
curl https://factory-worklog.vercel.app/api/backup-schedule

# 백업 시간 설정
curl -X PUT https://factory-worklog.vercel.app/api/backup-schedule \
  -H "Content-Type: application/json" \
  -d '{"times": ["18:40", "06:00"]}'
```

---

## ✅ 테스트 방법

### 1. UI에서 시간 추가

관리자 페이지 > 백업 설정 > `18:40` 입력 > 저장

### 2. Supabase에서 확인

```sql
-- backup_schedules 확인
SELECT * FROM backup_schedules;

-- Cron Job 확인
SELECT
  jobname,
  schedule,
  active
FROM cron.job
WHERE jobname LIKE 'backup-%';
```

**예상 결과:**
```
jobname      | schedule    | active
-------------|-------------|--------
backup-1840  | 40 9 * * *  | t
```

(UTC 09:40 = KST 18:40)

### 3. 실행 로그 확인

```sql
SELECT
  j.jobname,
  r.start_time,
  r.status,
  r.return_message
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.jobid
WHERE j.jobname LIKE 'backup-%'
ORDER BY r.start_time DESC
LIMIT 10;
```

---

## 🔧 문제 해결

### Q: Trigger가 실행되지 않는다

**확인:**
```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'backup_schedule_auto_refresh';
```

**해결:** `setup-backup-trigger.sql` 다시 실행

---

### Q: Cron Job이 생성되지 않는다

**확인:**
```sql
-- Extension 활성화 확인
SELECT * FROM pg_extension
WHERE extname IN ('pg_cron', 'pg_net');
```

**해결:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

### Q: 백업이 실행되지 않는다

**확인:**
1. Cron Job 등록 확인:
   ```sql
   SELECT * FROM cron.job WHERE jobname LIKE 'backup-%';
   ```

2. 실행 로그 확인:
   ```sql
   SELECT * FROM cron.job_run_details
   ORDER BY start_time DESC
   LIMIT 5;
   ```

3. Vercel 환경 변수 확인:
   - CRON_SECRET이 설정되어 있는지
   - Supabase SQL의 cron_secret과 동일한지

---

## 📚 파일 구조

```
prisma/
├── setup-backup-trigger.sql   # Trigger 설정 (1회만 실행)
├── setup-pg-cron.sql          # 수동 설정 (Trigger 사용 시 불필요)
└── README.md                  # 상세 가이드

src/app/api/
├── backup-schedule/
│   └── route.ts              # 백업 시간 CRUD API
└── cron/
    └── backup-workplace/
        └── route.ts          # 실제 백업 실행 API
```

---

## 🎯 핵심 요약

| 항목 | 설명 |
|------|------|
| **초기 설정** | Supabase에서 1회만 `setup-backup-trigger.sql` 실행 |
| **시간 관리** | 관리자 UI에서 추가/삭제 (SQL 불필요) |
| **자동화** | backup_schedules 변경 시 Trigger가 자동으로 cron job 재생성 |
| **실행 시간** | KST 기준 정확한 시간에 실행 |
| **비용** | Vercel Free 플랜 제한 없음 (pg_cron 사용) |

---

## 🚨 주의사항

1. **CRON_SECRET 보안**: 절대 GitHub에 커밋하지 마세요
2. **Trigger는 1회만 설정**: 재배포 시에도 다시 실행 불필요
3. **대량 변경**: 여러 시간을 한 번에 추가해도 Trigger가 1번만 실행됨
4. **Supabase Free 플랜**: pg_cron은 무료로 사용 가능

---

**설정 완료 후 관리자는 UI에서만 백업 시간을 관리하면 됩니다!** ✨
