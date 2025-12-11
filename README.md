SL미러텍 공장 관리 시스템 🏭
=============
그동안 작업자 배치와 작업 기록을 칠판과 엑셀에 수기로 관리해 왔습니다.
이 과정에서 기록 누락이 발생하거나, 실시간 공유가 어렵고 관리 효율도 떨어지는 문제가 있었습니다.

이 불편을 해결하기 위해 **웹 기반 공장 관리 시스템**을 직접 개발했습니다.

- **작업자 모드** (모바일 최적화):  
  작업 시작/종료 기록, 날짜별 작업 내역 확인
- **관리자 모드** (PC · 반응형 화면):  
  작업자 배치 관리, 작업 기록 관리, 실시간 공장 현황 관리
- **모니터 모드** (대형 TV 최적화):  
  공장 현황을 대형 스크린에서 실시간 조회

#### url
- 테스트 계정 : tester / 111111
- https://factory-worklog.vercel.app/

#### 개발 기간
2025.08 ~ 2025.09 (1개월)

#### 운영 및 고도화
2025.09 ~ (진행 중)

#### 역할
- 서비스 기획 및 UX/UI 와이어프레임 작성
- 프론트엔드 개발 (Next.js 기반 화면, Tanstack Query를 활용한 데이터 처리)
- 백엔드 개발 (API Routes, Prisma ORM을 이용한 CRUD 구현)
- 배포 및 운영 환경 구축 (Vercel, Supabase 연동)

#### 사용 기술
- **Frontend**: Next.js, React, TypeScript, Tanstack Query, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma
- **Infra**: Vercel, Supabase (DB/Storage/Realtime), Docker(Local)

#### AI 활용
- 서비스 기획과 핵심 설계·구현은 직접 진행했습니다.
- 반복적인 코드 작성, 리팩토링, 문서화 보조에는 Claude Code를 활용해 개발 효율을 높였습니다.

<br />

## 핵심 기능
### 실시간 작업장 현황 모니터링
- 관리자가 설정한 작업장 상황을 실시간으로 TV 화면에 표시
- 작업자가 작업 시작 시 화면에 즉시 반영되어, 진행 상태를 한눈에 확인 가능

### 작업장 관리
- 관리자가 편집 중일 때, 다른 관리자는 동시에 편집하지 못하도록 lock 기능 제공
- 작업자 배치 및 라인 상태 변경 시 모든 브라우저에서 실시간 반영
- 드래그 앤 드롭으로 작업자 대기 위치 및 라인 순서 직관적으로 변경 가능

### 작업 기록
- 작업자별 작업 기록 조회 및 관리
- 검색 필터를 통한 조건별 데이터 조회
- 조회한 데이터를 엑셀 파일로 추출 가능

### 직원 관리
- 직원 등록 및 권한(Role) 설정
- 직원별 면허증 이미지 첨부 및 관리

<br />

## ⭐️ 사용 가이드 문서
더 자세한 사용법과 전체 화면 캡처는 [사용 가이드 문서](https://kkomyoung.notion.site/27e8e4df974d807c8165fe913cdd000b)에서 확인할 수 있습니다.

<br />

## 문서
### Notion
* [테스트 문서](https://kkomyoung.notion.site/27e8e4df974d80b38ed1e679ec2f45ef?source=copy_link)

### Figma
* [작업자 모드 와이어프레임](https://www.figma.com/design/En44a0DuQjNLszsK5Sa2n1/SL%EB%AF%B8%EB%9F%AC%ED%85%8D-%EC%99%80%EC%9D%B4%EC%96%B4%ED%94%84%EB%A0%88%EC%9E%84?node-id=0-1&t=f2lgZxat8i4s507m-1)
