-- ============================================
-- SL미러텍 공장 관리 시스템 RLS 설정
-- ============================================
--
-- 목적: Row Level Security 활성화 및 정책 설정
-- - 모니터링 화면: 로그인 없이 READ 가능
-- - 관리자 화면: 로그인 필요, WRITE 가능
-- - role 기반 분기는 API 레벨에서 처리
--
-- 실행 방법:
-- 1. Supabase Dashboard > SQL Editor
-- 2. 아래 SQL 전체 복사/붙여넣기
-- 3. Run 클릭
-- ============================================

-- ============================================
-- 1. 기존 정책 삭제 (재실행 시 에러 방지)
-- ============================================

DROP POLICY IF EXISTS "users_authenticated_all" ON "public"."users";
DROP POLICY IF EXISTS "work_classes_read_all" ON "public"."work_classes";
DROP POLICY IF EXISTS "work_classes_write_authenticated" ON "public"."work_classes";
DROP POLICY IF EXISTS "factory_configs_read_all" ON "public"."factory_configs";
DROP POLICY IF EXISTS "factory_configs_write_authenticated" ON "public"."factory_configs";
DROP POLICY IF EXISTS "factory_lines_read_all" ON "public"."factory_lines";
DROP POLICY IF EXISTS "factory_lines_write_authenticated" ON "public"."factory_lines";
DROP POLICY IF EXISTS "line_shifts_read_all" ON "public"."line_shifts";
DROP POLICY IF EXISTS "line_shifts_write_authenticated" ON "public"."line_shifts";
DROP POLICY IF EXISTS "process_slots_read_all" ON "public"."process_slots";
DROP POLICY IF EXISTS "process_slots_write_authenticated" ON "public"."process_slots";
DROP POLICY IF EXISTS "training_logs_authenticated_all" ON "public"."training_logs";
DROP POLICY IF EXISTS "defect_logs_authenticated_all" ON "public"."defect_logs";
DROP POLICY IF EXISTS "workplace_snapshots_authenticated_all" ON "public"."workplace_snapshots";
DROP POLICY IF EXISTS "backup_schedules_authenticated_all" ON "public"."backup_schedules";

-- ============================================
-- 2. 모든 테이블 RLS 활성화
-- ============================================

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."work_classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."factory_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."factory_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."line_shifts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."process_slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."training_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."defect_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."workplace_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."backup_schedules" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. users 테이블 정책 (authenticated만 접근)
-- ============================================

CREATE POLICY "users_authenticated_all"
ON "public"."users"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 4. work_classes 테이블 정책
-- - 읽기(SELECT): 누구나 (anon + authenticated)
-- - 쓰기(INSERT/UPDATE/DELETE): authenticated만
-- ============================================

CREATE POLICY "work_classes_read_all"
ON "public"."work_classes"
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "work_classes_write_authenticated"
ON "public"."work_classes"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 5. factory_configs 테이블 정책
-- ============================================

CREATE POLICY "factory_configs_read_all"
ON "public"."factory_configs"
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "factory_configs_write_authenticated"
ON "public"."factory_configs"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 6. factory_lines 테이블 정책
-- ============================================

CREATE POLICY "factory_lines_read_all"
ON "public"."factory_lines"
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "factory_lines_write_authenticated"
ON "public"."factory_lines"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 7. line_shifts 테이블 정책
-- ============================================

CREATE POLICY "line_shifts_read_all"
ON "public"."line_shifts"
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "line_shifts_write_authenticated"
ON "public"."line_shifts"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 8. process_slots 테이블 정책
-- ============================================

CREATE POLICY "process_slots_read_all"
ON "public"."process_slots"
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "process_slots_write_authenticated"
ON "public"."process_slots"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 9. training_logs 테이블 정책 (authenticated만 접근)
-- ============================================

CREATE POLICY "training_logs_authenticated_all"
ON "public"."training_logs"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 10. defect_logs 테이블 정책 (authenticated만 접근)
-- ============================================

CREATE POLICY "defect_logs_authenticated_all"
ON "public"."defect_logs"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 11. workplace_snapshots 테이블 정책 (authenticated만 접근)
-- ============================================

CREATE POLICY "workplace_snapshots_authenticated_all"
ON "public"."workplace_snapshots"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 12. backup_schedules 테이블 정책 (authenticated만 접근)
-- ============================================

CREATE POLICY "backup_schedules_authenticated_all"
ON "public"."backup_schedules"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 완료!
-- ============================================
--
-- 다음 단계:
-- 1. 로그아웃 상태에서 모니터 페이지 접근 테스트
-- 2. 로그인 후 관리자 페이지에서 데이터 수정 테스트
-- 3. 401 에러가 사라졌는지 확인
--
-- ============================================
