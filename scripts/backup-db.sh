#!/bin/bash

# ============================================
# Supabase DB 백업 스크립트
# ============================================
# 사용법: npm run backup:prod
# 결과: backups/backup_YYYYMMDD_HHMMSS.sql
# ============================================

set -e

# 환경 변수 로드
if [ -f .env.production ]; then
  export $(grep -v '^#' .env.production | xargs)
fi

# 백업 디렉토리 생성
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# 파일명 생성 (날짜_시간)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "🔄 DB 백업 시작..."
echo "   대상: Supabase Production DB"
echo "   파일: $BACKUP_FILE"

# pg_dump 실행 (DIRECT_URL 사용 - pooler가 아닌 직접 연결)
# macOS: PostgreSQL 17 사용 (Supabase 서버 버전과 호환)
PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
if [ ! -f "$PG_DUMP" ]; then
  PG_DUMP="pg_dump"  # fallback to system pg_dump
fi

$PG_DUMP "$DIRECT_URL" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  > "$BACKUP_FILE"

# 파일 크기 확인
FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')

echo ""
echo "✅ 백업 완료!"
echo "   파일: $BACKUP_FILE"
echo "   크기: $FILE_SIZE"
echo ""
echo "💡 Google Drive에 업로드하려면:"
echo "   1. rclone 설치: brew install rclone"
echo "   2. Google Drive 연동: rclone config"
echo "   3. 업로드: rclone copy $BACKUP_FILE gdrive:sl-worklog-backup/"