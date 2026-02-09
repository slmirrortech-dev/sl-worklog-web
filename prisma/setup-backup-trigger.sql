-- ============================================
-- backup_schedules 자동 Cron Job 재생성 Trigger
-- ============================================
--
-- 목적:
-- backup_schedules 테이블 데이터 변경 시
-- 자동으로 pg_cron job을 재생성
--
-- UI에서 시간 추가/수정/삭제 → 즉시 cron job 반영
-- ============================================

-- ============================================
-- 1. Extension 활성화
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- 2. Cron Job 재생성 함수
-- ============================================

CREATE OR REPLACE FUNCTION refresh_backup_cron_jobs()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
  kst_time TIMESTAMP;
  utc_time TIMESTAMP;
  cron_minute TEXT;
  cron_hour TEXT;
  job_name TEXT;
  cron_schedule TEXT;
  -- ⚠️ [수동 설정 필요] Vercel 배포 URL로 변경하세요
  api_url TEXT := 'https://sl-worklog-web.vercel.app/api/cron/backup-workplace';

  -- ⚠️ [수동 설정 필요] Vercel 환경변수 CRON_SECRET과 동일한 값을 넣으세요
  -- 생성 방법: openssl rand -base64 32
  cron_secret TEXT := 'bQDDiKoC3+lHmoMI8l+iFDS24b2xhWTmn4qggMukWxs=';

  sql_cmd TEXT;
BEGIN
  -- ========================================
  -- Step 1: 기존 backup 관련 cron job 모두 삭제
  -- ========================================
  RAISE NOTICE '=== 기존 cron job 삭제 시작 ===';

  FOR rec IN
    SELECT jobname
    FROM cron.job
    WHERE jobname LIKE 'backup-%'
  LOOP
    PERFORM cron.unschedule(rec.jobname);
    RAISE NOTICE '✓ 삭제됨: %', rec.jobname;
  END LOOP;

  -- ========================================
  -- Step 2: backup_schedules 테이블 순회하며 재생성
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '=== 새 cron job 생성 시작 ===';

  FOR rec IN
    SELECT id, time
    FROM backup_schedules
    ORDER BY time
  LOOP
    -- KST → UTC 변환
    kst_time := ('2000-01-01 ' || rec.time || ':00')::TIMESTAMP;
    utc_time := kst_time AT TIME ZONE 'Asia/Seoul';

    -- UTC 시, 분 추출
    cron_minute := EXTRACT(minute FROM utc_time)::TEXT;
    cron_hour := EXTRACT(hour FROM utc_time)::TEXT;

    -- Cron 표현식 생성
    cron_schedule := cron_minute || ' ' || cron_hour || ' * * *';

    -- Job 이름 생성 (: 제거)
    job_name := 'backup-' || replace(rec.time, ':', '');

    -- HTTP POST 명령 생성
    sql_cmd := format(
      'SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object(
          ''Content-Type'', ''application/json'',
          ''Authorization'', ''Bearer %s''
        ),
        body := ''{}''::jsonb
      )',
      api_url,
      cron_secret
    );

    -- Cron Job 등록
    PERFORM cron.schedule(
      job_name,
      cron_schedule,
      sql_cmd
    );

    RAISE NOTICE '✓ 생성됨: % | UTC: % | KST: %',
      job_name, cron_schedule, rec.time;
  END LOOP;

  -- ========================================
  -- Step 3: 완료 메시지
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '=== 모든 cron job 생성 완료 ===';
  RAISE NOTICE '총 % 개의 스케줄이 등록되었습니다.',
    (SELECT COUNT(*) FROM backup_schedules);

  -- AFTER 트리거이므로 NULL 반환
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Trigger 생성
-- ============================================

-- 기존 Trigger 삭제 (재실행 시 에러 방지)
DROP TRIGGER IF EXISTS backup_schedule_auto_refresh ON backup_schedules;

-- Trigger 생성: INSERT, UPDATE, DELETE 발생 시 자동 재생성
CREATE TRIGGER backup_schedule_auto_refresh
AFTER INSERT OR UPDATE OR DELETE ON backup_schedules
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_backup_cron_jobs();

-- ============================================
-- 4. 초기 실행 (현재 데이터 기준으로 cron job 생성)
-- ============================================

DO $$
DECLARE
  rec RECORD;
  kst_time TIMESTAMP;
  utc_time TIMESTAMP;
  cron_minute TEXT;
  cron_hour TEXT;
  job_name TEXT;
  cron_schedule TEXT;
  -- ⚠️ [수동 설정 필요] 위 함수와 동일한 값으로 변경하세요
  api_url TEXT := 'https://sl-worklog-web.vercel.app/api/cron/backup-workplace';
  cron_secret TEXT := 'YOUR_CRON_SECRET_HERE';

  sql_cmd TEXT;
BEGIN
  RAISE NOTICE '=== 초기 cron job 생성 시작 ===';

  -- 기존 job 삭제
  FOR rec IN
    SELECT jobname FROM cron.job WHERE jobname LIKE 'backup-%'
  LOOP
    PERFORM cron.unschedule(rec.jobname);
    RAISE NOTICE '✓ 삭제됨: %', rec.jobname;
  END LOOP;

  -- 새 job 생성
  FOR rec IN SELECT id, time FROM backup_schedules ORDER BY time
  LOOP
    kst_time := ('2000-01-01 ' || rec.time || ':00')::TIMESTAMP;
    utc_time := kst_time AT TIME ZONE 'Asia/Seoul';
    cron_minute := EXTRACT(minute FROM utc_time)::TEXT;
    cron_hour := EXTRACT(hour FROM utc_time)::TEXT;
    cron_schedule := cron_minute || ' ' || cron_hour || ' * * *';
    job_name := 'backup-' || replace(rec.time, ':', '');

    sql_cmd := format(
      'SELECT net.http_post(
        url := %L,
        headers := jsonb_build_object(
          ''Content-Type'', ''application/json'',
          ''Authorization'', ''Bearer %s''
        ),
        body := ''{}''::jsonb
      )',
      api_url,
      cron_secret
    );

    PERFORM cron.schedule(job_name, cron_schedule, sql_cmd);
    RAISE NOTICE '✓ 생성됨: % | UTC: % | KST: %', job_name, cron_schedule, rec.time;
  END LOOP;

  RAISE NOTICE '=== 초기 cron job 생성 완료 ===';
  RAISE NOTICE '총 % 개의 스케줄이 등록되었습니다.', (SELECT COUNT(*) FROM backup_schedules);
END $$;

-- ============================================
-- 5. 확인
-- ============================================

-- Cron Job 목록 확인
SELECT
  jobname AS "Job 이름",
  schedule AS "Cron 표현식 (UTC)",
  active AS "활성화",
  CASE
    WHEN schedule ~ '^\d+ \d+ \* \* \*$' THEN
      to_char(
        (('2000-01-01 ' ||
          split_part(schedule, ' ', 2) || ':' ||
          split_part(schedule, ' ', 1) || ':00')::TIMESTAMP
          AT TIME ZONE 'UTC'
          AT TIME ZONE 'Asia/Seoul'
        ),
        'HH24:MI'
      ) || ' (KST)'
    ELSE schedule
  END AS "실행 시간"
FROM cron.job
WHERE jobname LIKE 'backup-%'
ORDER BY schedule;

-- ============================================
-- 동작 방식
-- ============================================
--
-- [초기 설정]
-- 1. 이 SQL을 Supabase SQL Editor에서 실행 (1회만)
-- 2. cron_secret 값만 실제 값으로 변경 필요
--
-- [이후 사용]
-- UI에서 백업 시간 추가/수정/삭제:
--   ┌─────────────────────────────────────┐
--   │ 관리자 페이지에서 시간 변경         │
--   │ (예: 18:40 추가)                    │
--   └────────────┬────────────────────────┘
--                │
--                ▼
--   ┌─────────────────────────────────────┐
--   │ backup_schedules 테이블 변경        │
--   │ INSERT/UPDATE/DELETE                │
--   └────────────┬────────────────────────┘
--                │
--                ▼
--   ┌─────────────────────────────────────┐
--   │ Trigger 자동 실행                   │
--   │ refresh_backup_cron_jobs()          │
--   └────────────┬────────────────────────┘
--                │
--                ▼
--   ┌─────────────────────────────────────┐
--   │ 1. 기존 cron job 전체 삭제          │
--   │ 2. 최신 데이터로 cron job 재생성    │
--   │ 3. backup-1840 등록 완료            │
--   └─────────────────────────────────────┘
--
-- ✅ 관리자는 SQL 몰라도 됨
-- ✅ UI에서 시간만 변경하면 자동 반영
-- ✅ 실시간 동기화
--
-- [주의사항]
-- - Trigger는 1회만 설정하면 됨 (재배포 불필요)
-- - cron_secret는 반드시 실제 값으로 변경
-- - 대량 변경 시 Trigger가 여러 번 실행될 수 있음 (문제없음)
-- ============================================
