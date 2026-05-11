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
- 폼 입력 → MDX 생성 + ZIP 다운로드 (혹은 파일시스템 직접 저장)
- `localStorage` 임시저장 / 복원 (draft 기능)
- 기존 프로젝트 목록 `/api/project-ids`로 불러와 ID 중복 체크
- `ContentBlockEditor` — 콘텐츠 블록(텍스트/이미지) 편집
- `MdxPreview` — MDX 미리보기
- 하단에 `ProjectZoomGallery` 미리보기 스트립 (auto-expand)
- 1280px 미만에서 narrow 레이아웃 전환

작업 이력:
- 다른 컴퓨터: 입력 폼 전체 구조 구축 (입력폼 → admin 폼 개선 → URL 라우팅)
- 이 컴퓨터(zoom-test): 갤러리 줌 인터랙션 완성 + 어드민 미리보기 스트립

## 다음 작업 예정

- 갤러리 컴포넌트 리팩토링 검토:
  - LOW RISK: LeftMetaPanel, RightContentArea, ControlPanel 분리
  - HIGH RISK (유지 권장): ScrollController, TextBlock
- zoom-test → 메인 프로젝트 마이그레이션 (B안: state 기반 + URL 업데이트)
