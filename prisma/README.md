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

## 3. 데이터베이스 마이그레이션

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
