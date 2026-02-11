-- ============================================
-- Supabase Realtime 활성화
-- ============================================
--
-- 목적: factory_lines, line_shifts, process_slots 테이블에 대한 Realtime 구독 활성화
--
-- 실행 방법:
-- 1. Supabase Dashboard > SQL Editor
-- 2. 아래 SQL 전체 복사/붙여넣기
-- 3. Run 클릭
--
-- 또는 Supabase Dashboard에서:
-- Database > Replication > 각 테이블 옆 "Enable" 버튼 클릭
-- ============================================

-- Realtime publication에 테이블 추가
ALTER PUBLICATION supabase_realtime ADD TABLE factory_lines;
ALTER PUBLICATION supabase_realtime ADD TABLE line_shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE process_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE work_classes;
ALTER PUBLICATION supabase_realtime ADD TABLE factory_configs;

-- ============================================
-- 확인 방법:
-- ============================================
--
-- 아래 쿼리로 활성화된 테이블 확인:
--
-- SELECT schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime';
--
-- ============================================
