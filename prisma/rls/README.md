# Row Level Security (RLS) 정책 가이드

## 개요

이 디렉토리는 Supabase PostgreSQL 데이터베이스의 Row Level Security (RLS) 정책을 관리합니다.
RLS는 데이터베이스 레벨에서 사용자별 데이터 접근 권한을 제어하는 PostgreSQL의 보안 기능입니다.

## RLS 정책 적용 방법

### 1. Supabase Dashboard에서 적용

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 "SQL Editor" 선택
4. `setup-rls.sql` 파일의 내용을 복사하여 붙여넣기
5. "Run" 버튼 클릭하여 실행

### 2. Supabase CLI로 적용

```bash
# Supabase CLI 설치 (설치되어 있지 않은 경우)
npm install -g supabase

# Supabase 프로젝트에 로그인
supabase login

# 데이터베이스 마이그레이션 생성
supabase migration new setup_rls

# setup-rls.sql 내용을 생성된 마이그레이션 파일에 복사

# 마이그레이션 적용
supabase db push
```

## 정책 개요

### Users 테이블
- **조회**: 본인 정보 또는 ADMIN/MANAGER
- **생성**: ADMIN만
- **수정**: 본인 정보(비밀번호 변경 등) 또는 ADMIN(권한 변경 등)
- **삭제**: ADMIN만

### WorkClass, FactoryLine 테이블
- **조회**: 모든 인증된 사용자 + 익명 사용자(모니터 모드)
- **생성/수정/삭제**: ADMIN만

### LineShift, ProcessSlot 테이블
- **조회**: 모든 인증된 사용자 + 익명 사용자(모니터 모드)
- **생성/수정/삭제**: ADMIN/MANAGER

## 헬퍼 함수

RLS 정책 파일에는 다음의 헬퍼 함수가 포함되어 있습니다:

- `auth.current_user_role()`: 현재 사용자의 역할 반환
- `auth.is_admin()`: 현재 사용자가 ADMIN인지 확인
- `auth.is_admin_or_manager()`: 현재 사용자가 ADMIN 또는 MANAGER인지 확인

## 모니터 모드

익명 사용자(로그인하지 않은 사용자)도 다음 테이블을 조회할 수 있습니다:
- work_classes
- factory_lines
- line_shifts
- process_slots

이는 공장 모니터 화면에서 로그인 없이 현황을 볼 수 있도록 하기 위함입니다.

**중요**: Users 테이블은 민감한 개인정보를 포함하므로 익명 접근이 불가능합니다.

## 주의사항

1. **RLS 우선순위**: RLS 정책은 애플리케이션 레벨의 권한 체크보다 우선합니다.
2. **Service Role Key**: Supabase의 Service Role Key를 사용하면 RLS를 우회할 수 있으므로, 서버 측 코드에서만 사용해야 합니다.
3. **Anon Key**: 클라이언트에서 사용하는 Anon Key는 RLS 정책의 영향을 받습니다.
4. **테스트**: 정책 적용 후 반드시 각 역할(ADMIN, MANAGER, WORKER)별로 접근 테스트를 수행하세요.

## 정책 업데이트

정책을 수정해야 할 경우:

1. `setup-rls.sql` 파일 수정
2. 기존 정책 삭제 후 재생성:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- 새 정책 생성
CREATE POLICY "policy_name" ON table_name ...
```

## 문제 해결

### 정책 충돌 오류

정책이 이미 존재하는 경우 다음 명령으로 삭제 후 재생성:

```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### RLS 비활성화 (개발 환경 전용)

**주의**: 운영 환경에서는 절대 RLS를 비활성화하지 마세요!

```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### 정책 확인

현재 적용된 정책 확인:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('users', 'work_classes', 'factory_lines', 'line_shifts', 'process_slots');
```

## 추가 리소스

- [PostgreSQL RLS 공식 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
