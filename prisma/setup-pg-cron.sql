-- ============================================
-- Supabase pg_cron 동적 백업 스케줄 설정
-- ============================================
--
-- 목적:
-- backup_schedules 테이블의 각 시간(HH:mm)을 읽어
-- 정확한 시간에 실행되는 개별 cron job을 생성
--
-- 동작:
-- 1. backup_schedules에 "05:00", "18:40" 같은 시간 저장
-- 2. 각 시간마다 별도의 cron job 생성
-- 3. KST → UTC 자동 변환
-- 4. pg_net으로 Vercel API 호출
--
-- 재실행 안전:
-- - 기존 backup- 관련 job 모두 삭제 후 재생성
-- ============================================

-- ============================================
-- 1. Extension 활성화
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- 2. 동적 Cron Job 생성
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
  api_url TEXT := 'https://factory-worklog.vercel.app/api/cron/backup-workplace';
  cron_secret TEXT := 'YOUR_CRON_SECRET_HERE'; -- 또는 Supabase Vault 사용 권장
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
  -- Step 2: backup_schedules 테이블 순회
  -- ========================================
  RAISE NOTICE '';
  RAISE NOTICE '=== 새 cron job 생성 시작 ===';

  FOR rec IN
    SELECT id, time
    FROM backup_schedules
    ORDER BY time
  LOOP
    -- ----------------------------------------
    -- 2-1. KST 시간을 UTC로 변환
    -- ----------------------------------------
    -- "05:00" → TIMESTAMP '2000-01-01 05:00:00'
    kst_time := ('2000-01-01 ' || rec.time || ':00')::TIMESTAMP;

    -- KST → UTC 변환 (KST는 UTC+9)
    -- 예: KST 05:00 → UTC 20:00 (전날)
    -- 예: KST 18:40 → UTC 09:40 (같은 날)
    -- AT TIME ZONE 한 번만 사용 (이중 적용 방지)
    utc_time := kst_time AT TIME ZONE 'Asia/Seoul';

    -- ----------------------------------------
    -- 2-2. UTC 시, 분 추출
    -- ----------------------------------------
    cron_minute := EXTRACT(minute FROM utc_time)::TEXT;
    cron_hour := EXTRACT(hour FROM utc_time)::TEXT;

    -- ----------------------------------------
    -- 2-3. Cron 표현식 생성
    -- ----------------------------------------
    -- 형식: "분 시 * * *"
    -- 예: "0 20 * * *" (매일 UTC 20:00 = KST 05:00)
    cron_schedule := cron_minute || ' ' || cron_hour || ' * * *';

    -- ----------------------------------------
    -- 2-4. Job 이름 생성
    -- ----------------------------------------
    -- KST 기준 시간으로 명명 (가독성)
    -- : 제거하여 안전성 확보
    -- 예: "backup-0500", "backup-1840"
    job_name := 'backup-' || replace(rec.time, ':', '');

    -- ----------------------------------------
    -- 2-5. HTTP POST 명령 생성
    -- ----------------------------------------
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

    -- ----------------------------------------
    -- 2-6. Cron Job 등록
    -- ----------------------------------------
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

END $$;

-- ============================================
-- 3. 생성된 Cron Job 확인
-- ============================================

SELECT
  jobname AS "Job 이름",
  schedule AS "Cron 표현식 (UTC)",
  active AS "활성화",
  CASE
    WHEN schedule ~ '^\d+ \d+ \* \* \*$' THEN
      -- UTC → KST 변환해서 표시 (참고용)
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
-- 4. 최근 실행 로그 확인
-- ============================================

SELECT
  j.jobname AS "Job 이름",
  r.start_time AS "시작 시간",
  r.end_time AS "종료 시간",
  r.status AS "상태",
  r.return_message AS "결과"
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.jobid
WHERE j.jobname LIKE 'backup-%'
ORDER BY r.start_time DESC
LIMIT 20;

-- ============================================
-- 동작 흐름 요약
-- ============================================
--
-- [초기 설정]
-- 1. backup_schedules 테이블에 백업 시간 등록:
--    INSERT INTO backup_schedules (id, time)
--    VALUES (gen_random_uuid()::text, '18:40');
--
-- 2. 위 SQL 실행 → 각 시간마다 개별 cron job 생성
--
-- [실행 흐름]
-- 시간이 되면:
--   ┌─────────────────────────────────────┐
--   │ UTC 09:40 (= KST 18:40)             │
--   │ pg_cron이 'backup-18:40' 실행       │
--   └────────────┬────────────────────────┘
--                │
--                ▼
--   ┌─────────────────────────────────────┐
--   │ pg_net.http_post()                  │
--   │ → Vercel API 호출                   │
--   │   POST /api/cron/backup-workplace   │
--   └────────────┬────────────────────────┘
--                │
--                ▼
--   ┌─────────────────────────────────────┐
--   │ API: 현재 KST 시간 = 18:40          │
--   │ backup_schedules 확인 → 일치!       │
--   │ → 백업 실행                         │
--   └─────────────────────────────────────┘
--
-- [시간 추가 시]
-- backup_schedules에 새 시간 INSERT 후
-- 위 SQL 재실행 → 기존 job 삭제 후 전체 재생성
--
-- [주의사항]
-- - 실행 전 반드시 수정 필요:
--   1. api_url: 실제 Vercel 배포 URL로 변경
--   2. cron_secret: 두 가지 방법 중 선택
--      Option A (간단): 직접 입력 'YOUR_CRON_SECRET_HERE'
--      Option B (권장): Vault 사용
--        먼저 실행: SELECT vault.create_secret('CRON_SECRET', 'actual-secret');
--        그 다음: cron_secret TEXT := vault.get_secret('CRON_SECRET');
-- - KST ↔ UTC 변환은 자동 처리
-- - 재실행 시 안전하게 덮어쓰기됨
-- ============================================
