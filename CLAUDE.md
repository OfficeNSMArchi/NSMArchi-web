# NSMArchi-web 프로젝트 컨텍스트

Next.js + TypeScript + Tailwind v4 건축사무소 포트폴리오.
멀티 브랜드 (NSM, Metalogic, NDB, SNP).
GitHub: `https://github.com/OfficeNSMArchi/NSMArchi-web` (branch: main)
어드민 페이지: `/admin/new-project`

## 핵심 파일

- `components/project-zoom-gallery.tsx` — 메인 갤러리 (건드릴 때 주의)
- `components/admin/ProjectForm.tsx` — 어드민 폼
- `app/globals.css` — 레이아웃 CSS 변수 단일 소스
- `types/project.ts` — 프로젝트 타입

## 레이아웃 기준값 (globals.css)

```css
:root { --photo-w: 70%; --margin-w: 15%; }
@media (orientation: landscape) and (max-width: 767px) { --photo-w: 50%; }
@media (min-width: 768px) { --photo-w: 35%; --margin-w: 25%; }
```
여기서만 수치 바꾸면 갤러리 전체 연동됨.

## project-zoom-gallery.tsx 주요 상수

```ts
const EXPAND_DURATION = 1500;
const PHOTO_STYLE = { width: 'var(--photo-w)', ... };  // globals.css 연동
const MARGIN_STYLE = { width: 'var(--margin-w)', ... };
```

## 갤러리 인터랙션

- 닫힌 상태: 커버 사진만 표시
- 커버 클릭 → row 확장 (width: 100vw), 가로 스크롤로 이미지 탐색
- 드래그 5px 이상 → isDragging=true → click 무시
- 뷰 전환: 리스트 ↔ 그리드 (framer-motion layoutId)
- 제어 버튼 그룹: `data-exclude-pin` 속성, `position: fixed`

## 어드민 폼 미리보기 스트립

- `ProjectZoomGallery`를 `defaultExpandedId`로 자동 expand해서 보여줌
- 기본 반 높이 → hover 시 전체 펼침 (300ms transition)
- 접기/펼치기 토글 + 드래그 핸들로 높이 조절
- 갤러리 버튼 숨김: `[&_[data-exclude-pin]]:hidden` + `translateZ(0)` (소스 무수정)

## [ADMIN-PREVIEW-PATCH] 마커

`project-zoom-gallery.tsx`에 5곳 패치 표시됨:
1. `defaultExpandedId` prop + useEffect auto-expand
2~5. `unoptimized={src.startsWith('blob:')}` — blob URL 이미지 지원

## 어드민 입력 폼 (`/admin/new-project`)

`components/admin/ProjectForm.tsx` — 핵심 기능:
- 프로젝트 ID 자동 생성 (회사 prefix + slug, Lock/Unlock 토글)
- 폼 입력 → MDX 생성 + ZIP 다운로드
- `localStorage` 임시저장 / 복원 (draft 기능)
- 기존 프로젝트 목록 `/api/project-ids`로 불러와 ID 중복 체크 (30초마다 자동 갱신)
- `ContentBlockEditor` — 콘텐츠 블록(텍스트/이미지) 편집
- `MdxPreview` — MDX 미리보기 + 기존 프로젝트 목록
- 하단에 `ProjectZoomGallery` 미리보기 스트립 (auto-expand)
- 1280px 미만에서 narrow 레이아웃 전환

### 어드민 헤더 버튼 (왼→오)
1. 로컬에서 불러오기
2. 다운로드 ▾ (MDX만 / ZIP)
3. **Git Save** — git pull 후 `public/projects/{id}/` 에 MDX+이미지 저장 (git 있을 때만 활성)
4. **Git Push** — `public/projects/`만 add → 자동 커밋메시지(날짜+변경파일) → push (git 있을 때만 활성)
5. 홈페이지에 등록 (GitHub API 커밋, Google 로그인 필요)

### Git Save / Git Push 관련 API
- `app/api/save-local/route.ts` — GET: git 감지, POST: git pull + 파일 저장 (multipart)
- `app/api/git-push/route.ts` — POST: git add public/projects/ → commit → push

### 프로젝트 스키마 필드 (2026-05-13 정리)
- `visibleOn: string[]` — 노출 브랜드 제어 ("ndb"|"snp"|"metalogic"|"nsm")
- `stageType: "design"|"research"|"software"|""` — 단계 타입
- `stage: number` — 단계 번호 (stageType에 따라 다른 레이블)
- `useType` — 건물 용도 (`lib/useTypeSchema.ts` 참고)
- `year` — YYYY-MM 형식 (연도 드롭다운 + 월 드롭다운)
- `area` — 숫자만 입력, m² 표시, S/M/L/XL 사이즈 뱃지 자동
- `category`, `featured`, `showOnNsm` — 삭제됨

### useTypeSchema (lib/useTypeSchema.ts)
complex / residential / office / commercial / neighborhood / mixed-use(복합시설) / residential-commercial(주상복합) / industrial / interior

### stageSchema (lib/stageSchema.ts)
- design: 0전략기획 ~ 7유지관리 (RIBA 준용, 한국 실무 힌트 포함)
- research: 0기획 / 1진행중 / 2완료
- software: 0요구사항분석 ~ 6운영

작업 이력:
- 다른 컴퓨터: 입력 폼 전체 구조 구축 (입력폼 → admin 폼 개선 → URL 라우팅)
- 이 컴퓨터(zoom-test): 갤러리 줌 인터랙션 완성 + 어드민 미리보기 스트립
- 2026-05-13: 스키마 정리(visibleOn/stageType/useType/area), Git Save/Push 기능 추가, 폼 UX 개선
- 2026-05-15: ImageSequencer 통합 시퀀서 완성 + AI 번역 기능 + 어드민 보안 강화

## Admin 자동 배포 시스템 (2026-05-12 추가)

Google(`office@nsmarchi.com`) 로그인 시 GitHub에 직접 커밋 → Vercel 자동 배포.

### 주요 파일
- `auth.ts` — NextAuth v5, office@nsmarchi.com만 허용
- `app/api/auth/[...nextauth]/route.ts` — NextAuth 핸들러
- `app/api/publish-project/route.ts` — 등록 GitHub 커밋 API
- `app/api/delete-project/route.ts` — 삭제 GitHub 커밋 API
- `app/admin/layout.tsx` — SessionProvider 래퍼

### 환경변수 (로컬 .env.local / Vercel 둘 다 필요)
```
AUTH_URL=http://localhost:3000        # Vercel은 https://nsmarchi.com
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
GITHUB_TOKEN=                         # repo Contents 쓰기 권한 PAT
GITHUB_OWNER=OfficeNSMArchi
GITHUB_REPO=NSMArchi-web
GROQ_API_KEY=                         # AI 번역용 (console.groq.com 무료 발급)
```
> `.env.local`은 gitignore됨 — 새 기기에서 직접 생성 필요  
> Vercel 환경변수는 Sensitive라 `vercel env pull` 불가 — 노션 등에 따로 보관 필요

### Google Cloud Console
- 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`, `https://nsmarchi.com/api/auth/callback/google`
- 테스트 사용자: `office@nsmarchi.com`

### 주의
- 작업 시작 전 `git pull` 필수 (버튼 등록이 GitHub에 직접 커밋)
- `area: "-"` 등 YAML 특수문자 따옴표 필요 (generateMdx.ts에서 자동 처리)

## 2026-05-15 주요 변경사항

### ImageSequencer (`components/admin/ImageSequencer.tsx`) — 신규
- 커버·설명 고정 슬롯 (비드래그) + 나머지 이미지/텍스트 블록 드래그 영역 분리
- 커버: 오렌지 테두리, 로드 시 썸네일 표시, ✕로 삭제
- 설명: 에메랄드 테두리, 클릭으로 편집 패널 토글
- 첫 번째 체크 이미지 → 자동 커버 배정
- 텍스트 블록 기본값 `"-"` (미리보기 자리 확보)
- 설명/텍스트블록 편집기에 `✨ AI 번역` 버튼 추가

### AI 번역 (`app/api/translate/route.ts`) — 신규
- Groq LLaMA 70B 사용 (무료, 한국 지역 제한 없음)
- 로컬: 인증 없이 사용 가능
- 배포: Google 로그인 필요 (session 체크)
- 미로그인 시 로그인 다이얼로그 표시, 로그인 후 draft 자동 복원

### 어드민 보안 (`middleware.ts`) — 신규
- 배포 환경(`production`)에서 `/admin` 전체 로그인 필요
- 로컬 개발 환경은 인증 없이 자유롭게 접근
- 미로그인 시 Google 로그인 → callbackUrl로 원래 페이지 복귀

### 핵심 파일 추가
- `components/admin/ImageSequencer.tsx` — 통합 시퀀서
- `app/api/translate/route.ts` — AI 번역 API
- `middleware.ts` — 어드민 접근 제어

## 작업 원칙
- 메인 프로젝트(`C:\my-lab-site`)에 직접 작업 — 워크트리 사용 안 함
- 코드 변경 후 `npm run dev`로 확인, push는 명시적 요청 시에만
- **Git Push 버튼은 `public/projects/`만** add함 — 코드 변경사항은 별도로 push
