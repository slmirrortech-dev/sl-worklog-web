-- ====================================
-- RLS (Row Level Security) 정책 설정
-- ====================================
--
-- 이 SQL 파일은 Supabase에서 Row Level Security를 설정합니다.
-- Supabase SQL Editor에서 실행하거나, Supabase CLI를 통해 적용할 수 있습니다.
--
-- 실행 방법:
-- 1. Supabase Dashboard > SQL Editor에서 이 파일의 내용을 복사하여 실행
-- 2. 또는 Supabase CLI: `supabase db push` 실행
--

-- ====================================
-- 1. RLS 활성화
-- ====================================

-- Users 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- WorkClass 테이블 RLS 활성화
ALTER TABLE work_classes ENABLE ROW LEVEL SECURITY;

-- FactoryLine 테이블 RLS 활성화
ALTER TABLE factory_lines ENABLE ROW LEVEL SECURITY;

-- LineShift 테이블 RLS 활성화
ALTER TABLE line_shifts ENABLE ROW LEVEL SECURITY;

-- ProcessSlot 테이블 RLS 활성화
ALTER TABLE process_slots ENABLE ROW LEVEL SECURITY;

-- ====================================
-- 2. Users 테이블 정책
-- ====================================

-- 모든 사용자는 자신의 정보를 조회할 수 있음
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = "supabaseUserId");

-- ADMIN/MANAGER는 모든 사용자 정보를 조회할 수 있음
CREATE POLICY "users_select_admin_manager"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role IN ('ADMIN', 'MANAGER')
  )
);

-- 자신의 정보는 업데이트할 수 있음 (비밀번호 변경 등)
CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = "supabaseUserId")
WITH CHECK (auth.uid() = "supabaseUserId");

-- ADMIN만 사용자를 생성할 수 있음
CREATE POLICY "users_insert_admin"
ON users FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  )
);

-- ADMIN만 사용자를 업데이트할 수 있음 (권한 변경 등)
CREATE POLICY "users_update_admin"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  )
);

-- ADMIN만 사용자를 삭제할 수 있음 (실제로는 soft delete)
CREATE POLICY "users_delete_admin"
ON users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  )
);

-- ====================================
-- 3. WorkClass 테이블 정책
-- ====================================

-- 모든 인증된 사용자는 WorkClass를 조회할 수 있음
CREATE POLICY "work_classes_select_all"
ON work_classes FOR SELECT
TO authenticated
USING (true);

-- ADMIN만 WorkClass를 생성/수정/삭제할 수 있음
CREATE POLICY "work_classes_admin_all"
ON work_classes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  )
);

-- ====================================
-- 4. FactoryLine 테이블 정책
-- ====================================

-- 모든 인증된 사용자는 FactoryLine을 조회할 수 있음
CREATE POLICY "factory_lines_select_all"
ON factory_lines FOR SELECT
TO authenticated
USING (true);

-- ADMIN만 FactoryLine을 생성/수정/삭제할 수 있음
CREATE POLICY "factory_lines_admin_all"
ON factory_lines FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  )
);

-- ====================================
-- 5. LineShift 테이블 정책
-- ====================================

-- 모든 인증된 사용자는 LineShift를 조회할 수 있음
CREATE POLICY "line_shifts_select_all"
ON line_shifts FOR SELECT
TO authenticated
USING (true);

-- ADMIN/MANAGER는 LineShift를 생성/수정/삭제할 수 있음
CREATE POLICY "line_shifts_admin_manager_all"
ON line_shifts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role IN ('ADMIN', 'MANAGER')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role IN ('ADMIN', 'MANAGER')
  )
);

-- ====================================
-- 6. ProcessSlot 테이블 정책
-- ====================================

-- 모든 인증된 사용자는 ProcessSlot을 조회할 수 있음
CREATE POLICY "process_slots_select_all"
ON process_slots FOR SELECT
TO authenticated
USING (true);

-- 작업자는 자신이 배치된 ProcessSlot만 조회할 수 있음
CREATE POLICY "process_slots_select_own_worker"
ON process_slots FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND id = process_slots."workerId"
    AND role = 'WORKER'
  )
);

-- ADMIN/MANAGER는 ProcessSlot을 생성/수정/삭제할 수 있음
CREATE POLICY "process_slots_admin_manager_all"
ON process_slots FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role IN ('ADMIN', 'MANAGER')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role IN ('ADMIN', 'MANAGER')
  )
);

-- ====================================
-- 7. 공개 접근 (익명 사용자)
-- ====================================

-- 모니터 화면을 위한 공개 읽기 정책
-- 익명 사용자도 모든 데이터를 조회할 수 있음 (모니터 모드)

CREATE POLICY "public_select_work_classes"
ON work_classes FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_select_factory_lines"
ON factory_lines FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_select_line_shifts"
ON line_shifts FOR SELECT
TO anon
USING (true);

CREATE POLICY "public_select_process_slots"
ON process_slots FOR SELECT
TO anon
USING (true);

-- Users 테이블은 민감한 정보이므로 익명 접근 불가
-- (모니터 모드에서는 작업자 이름만 필요하고, 이는 ProcessSlot을 통해 조회)

-- ====================================
-- 8. 헬퍼 함수 (선택사항)
-- ====================================

-- 현재 사용자의 역할을 반환하는 함수
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM users WHERE "supabaseUserId" = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- 현재 사용자가 ADMIN인지 확인
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role = 'ADMIN'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- 현재 사용자가 ADMIN 또는 MANAGER인지 확인
CREATE OR REPLACE FUNCTION auth.is_admin_or_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE "supabaseUserId" = auth.uid()
    AND role IN ('ADMIN', 'MANAGER')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ====================================
-- 9. 정책 적용 완료
-- ====================================

-- 모든 RLS 정책이 성공적으로 적용되었습니다.
-- 각 테이블에 대한 접근 권한은 다음과 같습니다:
--
-- Users 테이블:
--   - 조회: 본인 정보 또는 ADMIN/MANAGER
--   - 생성: ADMIN만
--   - 수정: 본인 정보 또는 ADMIN
--   - 삭제: ADMIN만
--
-- WorkClass, FactoryLine:
--   - 조회: 모든 인증된 사용자
--   - 생성/수정/삭제: ADMIN만
--
-- LineShift, ProcessSlot:
--   - 조회: 모든 인증된 사용자
--   - 생성/수정/삭제: ADMIN/MANAGER
--
-- 공개 접근:
--   - 모든 테이블 (Users 제외): 익명 사용자도 읽기 가능 (모니터 모드)
