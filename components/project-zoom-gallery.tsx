"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Project } from '@/types/project';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';
import { LAYOUT_MAX_W, LAYOUT_PX } from '@/lib/layout';
import { useViewMode } from '@/lib/view-mode-context';
import { formatArea, getSizeLabel } from '@/lib/projectUtils';
import { STAGES, getStageLabel, type StageType } from '@/lib/stageSchema';
import { List, Grid2X2, Pin, RotateCcw } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';

const ScrollWheelIcon = ({ vertical = false }: { vertical?: boolean }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <g style={{ transformOrigin: '32px 32px', transform: vertical ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}>
      <polyline points="14,24 6,32 14,40" />
      <polyline points="50,24 58,32 50,40" />
    </g>
  </svg>
);

const EXPAND_DURATION = 1500; // ms — 열기 애니메이션 속도
const COLLAPSE_DURATION = 1000; // ms — 닫기 애니메이션 속도
const DESKTOP_ZOOM_IN = 1.1; // 데스크탑에서 프로젝트 열릴 때 적용할 줌 배율
const SCROLL_BACK_DURATION = 2500; // ms — 닫을 때 커버사진 복귀 속도
const GRID_TO_LIST_SCROLL_DURATION = 2500; // ms — 그리드→리스트 전환 후 해당 프로젝트로 스크롤 속도
const TEXT_PADDING = 'px-3 md:px-8'; // 텍스트 슬라이드 안쪽 여백 (상하 제거)

// 레이아웃 비율 — globals.css의 --photo-w, --margin-w 와 단일 소스로 연동
// 닫힌 상태 중앙정렬: --margin-w*2 + --photo-w = 100% 이면 완벽 중앙
const MAX_CONTAINER_WIDTH = '1920px';
const PHOTO_STYLE = { width: 'var(--photo-w)', minWidth: 'var(--photo-w)', maxWidth: 'var(--photo-w)' };
const MARGIN_STYLE = { width: 'var(--margin-w)', minWidth: 'var(--margin-w)', maxWidth: 'var(--margin-w)' };
// ── 텍스트 모듈 설정 (여기서 조정) ──────────────────────────────
const TEXT_MODULE_RATIO = 0.7;                          // 1모듈 너비 = --photo-w × 이 값
const TEXT_MAX_MODULES  = 3;                            // 최대 모듈 수
const FONT_BLOCK_TITLE  = 'clamp(0.5rem, 0.75vw, 14pt)'; // vw = 뷰포트 기준, 컨테이너 크기와 무관
const FONT_BLOCK_BODY   = 'clamp(0.4rem, 0.65vw, 11pt)'; // 컨테이너가 바뀌어도 폰트 고정
// ─────────────────────────────────────────────────────────────────

// 패널 내 폰트 — cqw = 패널 너비의 1% (containerType: inline-size 기준)
const FONT_TITLE = 'clamp(0.4rem, 3cqw, 12pt)';
const FONT_META  = 'clamp(0.3rem, 2.5cqw, 10pt)';

const SITE_URL = 'https://nsmarchi.com';

async function loadKakaoSDK(): Promise<any> {
  return new Promise((resolve, reject) => {
    const win = window as any;
    if (win.Kakao) { resolve(win.Kakao); return; }
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
    script.onload = () => resolve(win.Kakao);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function ShareButtons({ projectId, title, imageUrl }: {
  projectId: string;
  title: string;
  imageUrl?: string;
}) {
  const [copied, setCopied] = useState(false);
  const pageUrl = `${SITE_URL}/projects/${projectId}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [pageUrl]);

  const open = (url: string) =>
    window.open(url, '_blank', 'width=620,height=450,scrollbars=yes');

  const shareKakao = async () => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!kakaoKey) { copyLink(); return; }
    try {
      const Kakao = await loadKakaoSDK();
      if (!Kakao.isInitialized()) Kakao.init(kakaoKey);
      const absImage = imageUrl
        ? (imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`)
        : `${SITE_URL}/og-default.png`;
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          imageUrl: absImage,
          link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
        },
        buttons: [{ title: '보러가기', link: { mobileWebUrl: pageUrl, webUrl: pageUrl } }],
      });
    } catch { copyLink(); }
  };

  const shareInstagram = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try { await navigator.share({ title, url: pageUrl }); return; } catch {}
    }
    copyLink();
  };

  const fullImageUrl = imageUrl
    ? (imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`)
    : undefined;

  const btns = [
    {
      key: 'kakao', label: 'KakaoTalk', action: shareKakao,
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.73 1.6 5.13 4.01 6.6-.15.56-.56 2.04-.64 2.35-.1.39.14.38.3.28.12-.08 1.96-1.32 2.76-1.85.5.07 1.02.1 1.57.1 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/></svg>,
    },
    {
      key: 'instagram', label: 'Instagram', action: shareInstagram,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>,
    },
    {
      key: 'linkedin', label: 'LinkedIn',
      action: () => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`),
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    },
    {
      key: 'facebook', label: 'Facebook',
      action: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`),
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
    {
      key: 'pinterest', label: 'Pinterest',
      action: () => open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}${fullImageUrl ? `&media=${encodeURIComponent(fullImageUrl)}` : ''}&description=${encodeURIComponent(title)}`),
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
    },
    {
      key: 'copy', label: copied ? '복사됨!' : '링크 복사', action: copyLink,
      icon: copied
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    },
  ];

  return (
    <div className="flex items-center gap-[6px]" data-no-close>
      {btns.map(btn => (
        <button
          key={btn.key}
          type="button"
          title={btn.label}
          onClick={(e) => { e.stopPropagation(); btn.action(); }}
          className="shrink-0 flex items-center justify-center text-gray-400 transition-all hover:opacity-50 active:scale-90"
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

function SlideshowImage({ srcs, interval, alt, isExpanded, firstCaption, captions, language }: {
  srcs: string[]; interval: number; alt: string; isExpanded: boolean;
  firstCaption?: { ko?: string; en?: string } | null;
  captions?: { en?: string; ko?: string }[]; language: string;
}) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!isExpanded || srcs.length <= 1) return;
    const id = setInterval(() => setCurrent(i => (i + 1) % srcs.length), interval * 1000);
    return () => clearInterval(id);
  }, [isExpanded, srcs.length, interval]);

  // index 0 → 정적 캐션, index 1+ → slideCaptions[current-1]
  const rawCaption = current === 0 ? firstCaption : captions?.[current - 1];
  const captionText = rawCaption
    ? (language === 'ko' ? (rawCaption.ko || rawCaption.en) : (rawCaption.en || rawCaption.ko))
    : null;
  const showOverlay = !!(firstCaption || captions?.length);

  return (
    <>
      {srcs.map((src, i) => (
        <Image key={src} src={src} alt={alt} fill
          className="object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
          unoptimized={src.startsWith('blob:')}
          draggable={false}
          priority={i === 0}
        />
      ))}
      {showOverlay && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 pointer-events-none transition-opacity duration-700"
          style={{ opacity: captionText ? 1 : 0, containerType: 'inline-size' }}
        >
          <p className="text-white leading-relaxed font-light whitespace-pre-wrap" style={{ fontSize: 'clamp(0.3rem, 2cqw, 9pt)' }}>
            {captionText || ' '}
          </p>
        </div>
      )}
    </>
  );
}

function TextBlock({ block, language, isExpanded }: {
  block: { type: 'text'; title?: { ko: string; en: string }; body?: { ko: string; en: string } };
  language: string;
  isExpanded: boolean;
}) {
  const [modules, setModules] = useState(1);
  const [settled, setSettled] = useState(false);
  const [measureKey, setMeasureKey] = useState(0); // 강제 재측정 트리거
  const innerRef = useRef<HTMLDivElement>(null);

  // 언어 바뀌면 처음부터 재계산
  useEffect(() => { setModules(1); setSettled(false); }, [language]);

  // 뷰포트 변화(브라우저 줌, 창 크기) 시 재측정
  // 부모 row가 transition-all로 width를 1500ms 애니메이션 → 즉시 측정시 mid-transition 값 잡힘
  // → 즉시 한 번, transition 끝난 후 한 번 더 측정
  useEffect(() => {
    let timeoutId: number;
    const handler = () => {
      setModules(1);
      setSettled(false);
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setModules(1);
        setSettled(false);
        setMeasureKey(k => k + 1); // 같은 값이어도 강제 재측정
      }, EXPAND_DURATION + 100);
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (settled) return;
    const el = innerRef.current;
    if (!el) return;
    // 폰트가 vw 고정이므로 modules가 바뀌어도 폰트 불변 → 순환참조 없음
    const id = requestAnimationFrame(() => {
      if (el.scrollHeight > el.clientHeight + 2 && modules < TEXT_MAX_MODULES) {
        setModules(m => m + 1); // 너비 확장
      } else {
        setSettled(true); // 측정 완료
      }
    });
    return () => cancelAnimationFrame(id);
  }, [modules, settled, language, measureKey]);

  const w = `calc(var(--photo-w) * ${TEXT_MODULE_RATIO * modules})`;
  // 측정 중: 1열 + 자연 흐름 (scrollHeight 정확 측정)
  // 측정 완료: 최종 columnCount + column-fill: auto + height 100%
  const columnStyle: React.CSSProperties = settled
    ? { columnCount: modules >= 2 ? 2 : 1, columnGap: '2rem', columnFill: 'auto', height: '100%' }
    : { columnCount: 1, columnGap: '2rem' };

  const hasContent = (block.title?.ko || block.title?.en || block.body?.ko || block.body?.en);
  if (!hasContent) return null;

  return (
    <div className={`shrink-0 relative transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
      isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    }`} style={{ width: w, minWidth: w, transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }}>
      <div ref={innerRef} className="absolute inset-0 overflow-hidden">
        <div className={`${TEXT_PADDING}`} style={columnStyle}>
          {(block.title?.ko || block.title?.en) && (
            <h3 className="font-bold uppercase tracking-tight break-inside-avoid"
                style={{ fontSize: FONT_BLOCK_TITLE }}>
              {language === 'ko' ? block.title.ko : block.title.en}
            </h3>
          )}
          {block.body && (
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-light"
               style={{ fontSize: FONT_BLOCK_BODY }}>
              {language === 'ko' ? block.body.ko : block.body.en}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProjectRowProps {
  project: Project;
  isExpanded: boolean;
  onToggle: (x: number, y: number) => void;
  layoutId: string;
  scrollMode: 'horizontal' | 'vertical';
}

const ProjectRow = ({ project, isExpanded, onToggle, layoutId, scrollMode }: ProjectRowProps) => {
  const { language } = useLanguage();
  const title = language === 'ko' ? project.titleKo : (project.title || project.titleKo);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isPointerDown = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartScrollLeft = useRef(0);

  // 닫힐 때 EXPAND_DURATION 동안 overflow-hidden 적용 지연 → 트랜지션이 잘리지 않음
  // useLayoutEffect: 렌더와 동기 실행 → isExpanded=true 직후 keepOpen=true 보장 (race condition 방지)
  const [keepOpen, setKeepOpen] = useState(false);
  useLayoutEffect(() => {
    if (isExpanded) {
      setKeepOpen(true);
    } else {
      const timer = setTimeout(() => setKeepOpen(false), COLLAPSE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    isDragging.current = false;
    isPointerDown.current = true;
    if (isExpanded) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current || !isExpanded) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    if (isExpanded && !isDragging.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5))
      isDragging.current = true;
    if (isDragging.current && scrollRef.current)
      scrollRef.current.scrollLeft = dragStartScrollLeft.current - dx;
  };
  const handlePointerUp = () => {
    isPointerDown.current = false;
  };
  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('[data-no-close]')) return;
    if (isExpanded && !isDragging.current) onToggle(e.clientX, e.clientY);
  };
  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging.current) onToggle(e.clientX, e.clientY);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!isExpanded) {
      const start = el.scrollLeft;
      if (start === 0) return;
      const startTime = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - startTime) / SCROLL_BACK_DURATION, 1);
        const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.scrollLeft = start * (1 - ease);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      return;
    }
    const handleWheel = (e: WheelEvent) => {
      if (scrollMode === 'horizontal') {
        e.preventDefault();
        el.scrollLeft += e.deltaY + e.deltaX;
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.3) {
        e.preventDefault();
        el.scrollLeft += e.deltaX * 1.5;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isExpanded, scrollMode]);

  return (
    <div
      id={`project-${project.id}`}
      className="relative w-full mx-auto flex flex-col items-center mb-6"
      style={{ maxWidth: MAX_CONTAINER_WIDTH }}
    >
      {/* 
        Container is always 100% of parent wide. 
        When not expanded, overflow is hidden, and scroll is fixed at 0.
        Because Left=25% and Photo=50%, the Photo is naturally perfectly centered!
        No JS scrolling or layout shifting occurs.
      */}
      <div
        ref={scrollRef}
        className={`flex items-stretch gap-[2px] md:gap-1 transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded
            ? 'overflow-x-auto hide-scrollbar cursor-pointer'
            : keepOpen
              ? 'overflow-x-auto hide-scrollbar pointer-events-none w-full'
              : 'overflow-hidden w-full'
        }`}
        style={{
          transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms`,
          ...(isExpanded ? { width: '100vw' } : {}),
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleContainerClick}
      >
        {/* Left Content (Margin Space: 15% on mobile, 25% on desktop) */}
        <div
          className="shrink-0 relative"
          style={{ ...MARGIN_STYLE }}
        >
          <div
            className="absolute inset-0 flex flex-col items-end justify-start text-right px-1 md:px-4 overflow-y-auto hide-scrollbar"
            style={{ containerType: 'inline-size', gap: 'clamp(0.25rem, 0.6cqw, 0.75rem)' }}
          >
            {/* 제목 + 로케이션 — 항상 표시 */}
            <h2
              className="font-normal font-sans tracking-tighter uppercase leading-tight break-words w-full"
              style={{ fontSize: FONT_TITLE }}
            >
              {title}
            </h2>
            <p className="uppercase tracking-[0.2em] text-gray-500 font-normal break-words w-full"
               style={{ fontSize: FONT_META }}>
              {language === 'ko' ? project.locationKo : project.location}
            </p>

            {/* 스테이지 · 연도 · 면적 · 용도 — 확장시만 표시 */}
            <div
              className={`flex flex-col space-y-1 uppercase tracking-[0.2em] text-gray-500 font-normal w-full transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              style={{ fontSize: FONT_META, transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }}
            >
              <p className="break-words mt-[5em]">{language === 'ko' ? project.useKo : project.use}</p>
              {getSizeLabel(project.area) ? (
                <p className="flex items-baseline justify-end gap-0 w-full">
                  {(['S', 'M', 'L', 'XL'] as const).map((s, i) => (
                    <React.Fragment key={s}>
                      {i > 0 && <span style={{ color: 'rgba(156,163,175,0.4)' }}>.</span>}
                      <span style={{ color: s === getSizeLabel(project.area) ? '#1f2937' : 'rgba(156,163,175,0.4)' }}>{s}</span>
                    </React.Fragment>
                  ))}
                  <span className="mx-1 opacity-40">—</span>
                  <span>{formatArea(project.area)}</span>
                </p>
              ) : (
                <p>{formatArea(project.area)}</p>
              )}
              {/* 스테이지/연도 + 프로그레스 바 */}
              {project.stageType && project.stage !== undefined ? (() => {
                const stageList = STAGES[project.stageType as StageType]
                  ?.filter(s => !(project.stageType === 'design' && s.key === 7));
                if (!stageList) return <><div className="h-[2.5em]" /><p>{project.year?.slice(0, 4)}</p></>;
                const current = Math.min(project.stage as number, stageList[stageList.length - 1]?.key ?? 99);
                const label = getStageLabel(project.stageType as StageType, project.stage as number, language === 'ko' ? 'ko' : 'en');
                return (
                  <div className="flex flex-col items-end gap-[4px] w-full mt-[2.5em]">
                    <p className="w-full">
                      {label}{project.year ? <span className="ml-[0.4em]">{project.year.slice(0, 4)}</span> : null}
                    </p>
                    <div className="flex items-center justify-end gap-[2px] w-full">
                      {stageList.map((s) => (
                        <div
                          key={s.key}
                          className="flex-shrink-0"
                          style={{
                            width: '10px', height: '4px',
                            transform: 'skewX(-20deg)',
                            background: s.key <= current ? 'currentColor' : 'rgba(128,128,128,0.2)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })() : <p className="mt-[2.5em]">{project.year?.slice(0, 4)}</p>}
            </div>
          </div>
          {/* 공유 버튼 — 우 하단 고정 */}
          <div
            className={`absolute bottom-0 right-1 md:right-4 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            style={{ transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <ShareButtons
              projectId={project.id}
              title={title}
              imageUrl={project.image}
            />
          </div>
        </div>

        {/* Anchor Image (Cover Photo: 70% on mobile, 50% on desktop) */}
        <motion.div
          layoutId={layoutId}
          transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
          className={`shrink-0 relative aspect-[4/3] transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded
              ? 'shadow-xl'
              : 'cursor-pointer shadow-sm hover:shadow-md hover:opacity-95'
          }`}
          style={{ ...PHOTO_STYLE, transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }}
          onClick={handleCoverClick}
        >
          {project.image ? (
           <Image
            src={project.image}
            alt={title}
            fill
            sizes="(max-width: 768px) 70vw, 30vw"
            className="object-cover"
            quality={90}
            draggable={false}
            priority
            unoptimized={project.image?.startsWith('blob:')} // [ADMIN-PREVIEW-PATCH] blob URL 지원
          />
          ) : (
            <div className="absolute inset-0 bg-gray-100" />
          )}
          {/* 브랜드 로고 오버레이 — 확장시만 표시 */}
          {project.companies?.some(c => ['ndb', 'snp', 'metalogic'].includes(c)) && (
            <div
              className={`absolute top-3 left-3 flex items-center gap-2 pointer-events-none transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isExpanded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }}
            >
              {project.companies.includes('ndb') && (
                <img src="/branding/ndb-v.svg" alt="NDB" className="h-5 md:h-6 w-auto object-contain" draggable={false} />
              )}
              {project.companies.includes('snp') && (
                <img src="/branding/snp-v.svg" alt="SNP" className="h-5 md:h-6 w-auto object-contain" draggable={false} />
              )}
              {project.companies.includes('metalogic') && (
                <img src="/branding/meta-logic-v.svg" alt="Metalogic" className="h-5 md:h-6 w-auto object-contain" draggable={false} />
              )}
            </div>
          )}
        </motion.div>

        {/* Right Content: description always first, then content blocks (or fallback images) */}

        {/* Description — reuses TextBlock for consistent sizing, font, overflow */}
        <TextBlock
          block={{ type: 'text', body: { ko: project.descriptionKo, en: project.description || project.descriptionKo } }}
          language={language}
          isExpanded={isExpanded}
        />

        {/* Content blocks if any, otherwise fallback images array */}
        {(project.content && project.content.length > 0) ? (
          project.content
            .filter(block => !(block.type === 'image' && block.src === project.image))
            .map((block, i) => {
              if (block.type === 'text') {
                return <TextBlock key={`content-${i}`} block={block} language={language} isExpanded={isExpanded} />;
              }
              if (block.type === 'map' && block.lat != null && block.lng != null) {
                return (
                  <div key={`content-${i}`} className={`shrink-0 aspect-[4/3] relative overflow-hidden transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`} style={{ ...PHOTO_STYLE, transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }}>
                    <GoogleMap lat={block.lat} lng={block.lng} zoom={block.zoom ?? 15} mapType={block.mapType} />
                  </div>
                );
              }
              if (block.type === 'image') {
                const staticCaption = block.showCaption
                  ? { ko: block.captionKo, en: block.caption }
                  : null;
                return (
                  <div key={`content-${i}`} className={`shrink-0 aspect-[4/3] relative transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`} style={{ ...PHOTO_STYLE, transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }}>
                    {block.slides?.length ? (
                      // 슬라이드쇼: showCaption이 두 캡션 모두 통제
                      <SlideshowImage
                        srcs={[block.src, ...block.slides]}
                        interval={block.slideInterval ?? 3}
                        alt={block.alt || "Detail"}
                        isExpanded={isExpanded}
                        firstCaption={staticCaption}
                        captions={block.showCaption ? block.slideCaptions : undefined}
                        language={language}
                      />
                    ) : (
                      <>
                        <Image src={block.src} alt={block.alt || "Detail"} fill className="object-cover" quality={90} unoptimized={block.src?.startsWith('blob:')} /* [ADMIN-PREVIEW-PATCH] */ />
                        {staticCaption && (staticCaption.ko || staticCaption.en) && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 pointer-events-none" style={{ containerType: 'inline-size' }}>
                            <p className="text-white leading-relaxed font-light whitespace-pre-wrap" style={{ fontSize: 'clamp(0.3rem, 2cqw, 9pt)' }}>
                              {language === 'ko' ? (staticCaption.ko || staticCaption.en) : (staticCaption.en || staticCaption.ko)}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              }
              return null;
            })
        ) : (
          project.images?.filter(img => img !== project.image).map((img, i) => (
            <div key={i} className={`shrink-0 aspect-[4/3] relative shadow-lg bg-gray-100 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`} style={{ ...PHOTO_STYLE, transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }}>
              <Image src={img} alt={`${title} ${i}`} fill className="object-contain md:object-cover" quality={90} unoptimized={img?.startsWith('blob:')} /* [ADMIN-PREVIEW-PATCH] */ />
            </div>
          ))
        )}
        
        {/* Spacer at the end for comfortable scrolling */}
           <div className={`shrink-0 h-full transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`} style={{ ...MARGIN_STYLE, transitionDuration: `${isExpanded ? EXPAND_DURATION : COLLAPSE_DURATION}ms` }} />
      </div>

    </div>
  );
};

// [ADMIN-PREVIEW-PATCH] defaultExpandedId prop 추가 — 어드민 전체 미리보기 오버레이용
// 업데이트 시 이 prop과 아래 useEffect 분기, 그리고 각 Image의 unoptimized 조건을 수동으로 다시 추가할 것
interface GridSection { label: string; projects: Project[] }
export const ProjectZoomGallery = ({ projects, storageKey = 'gallery-expanded', defaultExpandedId, gridSections }: { projects: Project[], storageKey?: string, defaultExpandedId?: string, gridSections?: GridSection[] }) => {
  // 서버/클라 hydration 일치 위해 빈 상태로 시작, 마운트 후 sessionStorage 동기화
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    // [ADMIN-PREVIEW-PATCH] defaultExpandedId가 있으면 해당 프로젝트를 즉시 expand
    if (defaultExpandedId) {
      setExpandedIds(new Set([defaultExpandedId]));
      return;
    }
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        setExpandedIds(new Set(ids));
        if (ids.length === 1) scrollToCenter(ids[0], 1200, 400);
      }
    } catch {}
  }, [storageKey, defaultExpandedId]); // eslint-disable-line react-hooks/exhaustive-deps
  const { viewMode, setViewMode, scrollMode, setScrollMode } = useViewMode();
  const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('list');
  const [fading, setFading] = useState(false);
  const savedExpandedIds = useRef<Set<string>>(new Set());
  const { language } = useLanguage();

  const scrollToCenter = (id: string, duration: number, delay = 0) => {
    setTimeout(() => {
      const el = document.getElementById(`project-${id}`);
      if (!el) return;
      const targetY = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.offsetHeight / 2;
      const startY = window.scrollY;
      const diff = targetY - startY;
      if (Math.abs(diff) < 2) return;
      const startTime = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        window.scrollTo(0, startY + diff * ease);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
  };


  const switchView = useCallback((mode: 'list' | 'grid') => {
    if (mode === displayMode) return;
    if (mode === 'grid') {
      const centerY = window.innerHeight / 2;
      let closestId: string | null = null;
      let closestDist = Infinity;
      projects.forEach(p => {
        const el = document.getElementById(`project-${p.id}`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - centerY);
        if (dist < closestDist) { closestDist = dist; closestId = p.id; }
      });
      savedExpandedIds.current = expandedIds;
      setFading(true);
      setTimeout(() => {
        setExpandedIds(new Set());
        setDisplayMode(mode);
        setFading(false);
        setTimeout(() => {
          if (!closestId) return;
          const el = document.getElementById(`project-${closestId}`);
          if (!el) return;
          const targetY = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.offsetHeight / 2;
          const startY = window.scrollY;
          const diff = targetY - startY;
          const duration = 1500;
          const startTime = performance.now();
          const step = (now: number) => {
            const t = Math.min((now - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            window.scrollTo(0, startY + diff * ease);
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, 300);
      }, 300);
    } else {
      setFading(true);
      setTimeout(() => {
        setDisplayMode(mode);
        setFading(false);
        setTimeout(() => {
          setExpandedIds(savedExpandedIds.current);
          const ids = [...savedExpandedIds.current];
          if (ids.length === 1) {
            scrollToCenter(ids[0], GRID_TO_LIST_SCROLL_DURATION, 0);
          }
        }, 300);
      }, 300);
    }
  }, [displayMode, expandedIds, projects]);

  useEffect(() => {
    switchView(viewMode);
  }, [viewMode, switchView]);

  const [buttonPos, setButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [pinned, setPinned] = useState(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const gestureVel = useRef({ x: 0, y: 0 });
  const handleToggle = (id: string, x: number, y: number) => {
    if (!pinned) setButtonPos({ x, y });
    setExpandedIds(prev => {
      const isOpening = !prev.has(id);
      if (isOpening) {
        const next = new Set(prev);
        next.add(id);
        scrollToCenter(id, EXPAND_DURATION, 100);
        setTimeout(() => {
          window.history.pushState(null, '', `/projects/${id}`);
        }, 0);
        return next;
      } else {
        // 이미 열린 상태 — 닫지 않고 화면 중앙으로 스크롤
        scrollToCenter(id, 800, 0);
        return prev;
      }
    });
  };

  const handleGridClick = (id: string) => {
    setFading(true);
    window.history.pushState(null, '', `/projects/${id}`);
    setTimeout(() => {
      setViewMode('list');
      setDisplayMode('list');
      setExpandedIds(prev => new Set(prev).add(id));
      setFading(false);
      setTimeout(() => {
        const el = document.getElementById(`project-${id}`);
        if (!el) return;
        const targetY = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.offsetHeight / 2;
        const startY = window.scrollY;
        const diff = targetY - startY;
        const startTime = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - startTime) / GRID_TO_LIST_SCROLL_DURATION, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          window.scrollTo(0, startY + diff * ease);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, 100);
    }, 300);
  };

  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify([...expandedIds])) } catch {}
  }, [expandedIds, storageKey]);

  useEffect(() => {
    const handler = () => {
      setExpandedIds(new Set())
      try { sessionStorage.removeItem(storageKey) } catch {}
    }
    window.addEventListener('nsm-reset', handler);
    return () => window.removeEventListener('nsm-reset', handler);
  }, [storageKey]);

  const anyExpanded = expandedIds.size > 0 && displayMode === 'list';

  const wrapperRef = useRef<HTMLDivElement>(null);

  // 데스크탑: 프로젝트 열릴 때 갤러리 전체 zoom (layout에 영향 → 다른 row들도 밀려남)
  // CSS zoom transition이 브라우저마다 불안정 → rAF로 직접 보간
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) return;
    const target = anyExpanded ? DESKTOP_ZOOM_IN : 1;
    const from = parseFloat((el.style.zoom as string) || '1') || 1;
    if (from === target) return;
    const duration = anyExpanded ? EXPAND_DURATION : COLLAPSE_DURATION;
    const startTime = performance.now();
    let rafId: number;
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      el.style.zoom = String(from + (target - from) * ease);
      if (t < 1) { rafId = requestAnimationFrame(step); }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [anyExpanded]);

  // 언마운트 시에만 zoom 초기화
  useEffect(() => {
    const el = wrapperRef.current;
    return () => { if (el) el.style.zoom = ''; };
  }, []);

  // 버튼 초기 위치 — 좌 하단 고정
  useEffect(() => {
    setButtonPos({ x: 250, y: window.innerHeight - 55 });
  }, []);

  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pinned) return;
      const target = e.target as Element;
      if (target.closest('[data-exclude-pin]')) return;
      if (document.getElementById('site-footer')?.contains(target)) return;
      if (controlRef.current?.contains(target)) return;
      setButtonPos({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [pinned]);

  // 헤더 아래 섹션 라벨: 화면 중앙에 가장 가까운 프로젝트의 섹션명 추적
  const [centerLabel, setCenterLabel] = useState('');
  useEffect(() => {
    if (!gridSections) { setCenterLabel(''); return; }
    const labelMap: Record<string, string> = Object.fromEntries(
      gridSections.flatMap(({ label, projects: sps }) => sps.map(p => [p.id, label]))
    );
    const update = () => {
      const centerY = window.innerHeight / 2;
      let closestId: string | null = null;
      let closestDist = Infinity;
      projects.forEach(p => {
        const el = document.getElementById(`project-${p.id}`);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - centerY);
        if (dist < closestDist) { closestDist = dist; closestId = p.id; }
      });
      if (closestId) setCenterLabel(labelMap[closestId] ?? '');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [gridSections, projects, displayMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // 확장 중 커스텀 커서 + 마우스 방향으로 스크롤 모드 전환
  useEffect(() => {
    if (!anyExpanded) {
      setMousePos(null);
      gestureVel.current = { x: 0, y: 0 };
      return;
    }
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const vel = gestureVel.current;
      vel.x = vel.x * 0.85 + e.movementX;
      vel.y = vel.y * 0.85 + e.movementY;
      if (Math.abs(vel.x) > 50 && Math.abs(vel.x) > Math.abs(vel.y) * 1.5) {
        setScrollMode('horizontal');
        vel.x = 0; vel.y = 0;
      } else if (Math.abs(vel.y) > 50 && Math.abs(vel.y) > Math.abs(vel.x) * 1.5) {
        setScrollMode('vertical');
        vel.x = 0; vel.y = 0;
      }
    };
    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, [anyExpanded, setScrollMode]);

  return (
    <LayoutGroup>
    <div ref={wrapperRef} className="w-full relative flex flex-col items-center">
<div className="w-full flex flex-col items-center pb-[20px]" style={{ opacity: fading ? 0 : 1, transition: 'opacity 300ms ease' }}>
        {displayMode === 'list' ? (
          projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              isExpanded={expandedIds.has(project.id)}
              onToggle={(x, y) => handleToggle(project.id, x, y)}
              layoutId={project.id}
              scrollMode={scrollMode}
            />
          ))
        ) : (
          <div className={`w-full grid grid-cols-2 lg:grid-cols-3 gap-2 pb-2 animate-in fade-in duration-500 ${LAYOUT_MAX_W} ${LAYOUT_PX}`}>
            {gridSections ? (
              gridSections.flatMap(({ label, projects: sectionProjects }) => {
                if (sectionProjects.length === 0) return [];
                const [firstProject, ...restProjects] = sectionProjects;
                const firstTitle = language === 'ko' ? firstProject.titleKo : (firstProject.title || firstProject.titleKo);
                return [
                  /* Section start cell: narrow label column (5%) + first project (95%) */
                  <div key={`section-${label}`} className="relative w-full aspect-[4/3] flex">
                    <div className="w-[5%] h-full flex items-start justify-center pt-1">
                      <span className="text-[9px] font-semibold tracking-[0.15em] text-foreground [writing-mode:vertical-rl] rotate-180 whitespace-pre">
                        {"   "}+{"   "}{label}
                      </span>
                    </div>
                    <motion.button
                      layoutId={firstProject.id}
                      id={`project-${firstProject.id}`}
                      transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
                      onClick={() => handleGridClick(firstProject.id)}
                      className="relative flex-1 h-full overflow-hidden group bg-gray-100 p-0 border-0"
                    >
                      {firstProject.image ? (
                        <Image src={firstProject.image} alt={firstTitle} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" quality={90} unoptimized={firstProject.image?.startsWith('blob:')} />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-2 px-3 pointer-events-none flex items-end justify-start">
                        <p className="text-white text-xs font-normal tracking-[0.15em] uppercase leading-tight text-left">{firstTitle}</p>
                      </div>
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />
                    </motion.button>
                  </div>,
                  ...restProjects.map(project => {
                    const title = language === 'ko' ? project.titleKo : (project.title || project.titleKo);
                    return (
                      <motion.button
                        key={project.id}
                        id={`project-${project.id}`}
                        layoutId={project.id}
                        transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
                        onClick={() => handleGridClick(project.id)}
                        className="relative w-full aspect-[4/3] overflow-hidden group bg-gray-100 p-0 border-0"
                      >
                        {project.image ? (
                          <Image src={project.image} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" quality={90} unoptimized={project.image?.startsWith('blob:')} />
                        ) : (
                          <div className="absolute inset-0 bg-gray-100" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-2 px-3 pointer-events-none flex items-end justify-start">
                          <p className="text-white text-xs font-normal tracking-[0.15em] uppercase leading-tight text-left">{title}</p>
                        </div>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />
                      </motion.button>
                    );
                  }),
                ];
              })
            ) : (
              projects.map((project) => {
                const title = language === 'ko' ? project.titleKo : (project.title || project.titleKo);
                return (
                  <motion.button
                    key={project.id}
                    id={`project-${project.id}`}
                    layoutId={project.id}
                    transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
                    onClick={() => handleGridClick(project.id)}
                    className="relative w-full aspect-[4/3] overflow-hidden group bg-gray-100 p-0 border-0"
                  >
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized={project.image?.startsWith('blob:')} // [ADMIN-PREVIEW-PATCH]
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-100" />
                    )}
                    {/* 타이틀 — 좌측 하단 고정 */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-2 px-3 pointer-events-none flex items-end justify-start">
                      <p className="text-white text-xs font-normal tracking-[0.15em] uppercase leading-tight text-left">{title}</p>
                    </div>
                    {/* 호버 시 살짝 밝아지는 오버레이 */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />
                  </motion.button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>

    {/* 스크롤 컨트롤 — 클릭 위치에 fixed 표시 */}
    <div
      ref={controlRef}
      data-exclude-pin
      className="flex fixed z-40 flex-col items-center gap-0"
      style={{
        left: buttonPos ? buttonPos.x - 30 : 0,
        top: buttonPos ? buttonPos.y : 0,
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.5s cubic-bezier(0.4,0,0.2,1), top 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* 핀 — 데스크탑 전용 */}
      <button
        onClick={() => setPinned(p => !p)}
        className="hidden md:flex p-0 mb-2"
        style={{ color: 'white', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))', opacity: pinned ? 1 : 0.4 }}
        aria-label="위치 고정"
      >
        <Pin size={16} style={{ transform: pinned ? 'rotate(0deg)' : 'rotate(45deg)', transition: 'transform 0.2s' }} />
      </button>
      {/* 뷰 전환 — 데스크탑 전용 */}
      <button
        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
        className="hidden md:flex p-0"
        style={{ color: 'white', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
        aria-label="뷰 전환"
      >
        {viewMode === 'list' ? <Grid2X2 size={20} /> : <List size={20} />}
      </button>
      {/* 전체 닫기 */}
      <button
        onClick={() => { setExpandedIds(new Set()); try { sessionStorage.removeItem(storageKey) } catch {} }}
        className={`hidden md:flex p-1 transition-opacity duration-300 ${anyExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ color: 'white', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
        aria-label="전체 닫기"
      >
        <RotateCcw size={20} />
      </button>
    </div>

    {/* 현재 섹션 표시 — 헤더 바로 아래, 리스트 뷰 + gridSections 있을 때 */}
    {gridSections && displayMode === 'list' && (
      <div
        data-exclude-pin
        className={`fixed left-0 right-0 z-30 pointer-events-none flex items-center ${LAYOUT_PX}`}
        style={{ top: 'var(--header-h, 48px)', paddingTop: '0.4rem' }}
      >
        <span className="text-[9px] font-semibold tracking-[0.15em] text-muted-foreground uppercase whitespace-pre transition-opacity duration-300" style={{ opacity: centerLabel ? 1 : 0 }}>
          {"   "}+{"   "}{centerLabel}
        </span>
      </div>
    )}

    {/* 커스텀 커서 — 확장 중에만 표시 */}
    {anyExpanded && mousePos && (
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
          color: 'white',
          filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.8))',
        }}
      >
        <ScrollWheelIcon vertical={scrollMode === 'vertical'} />
      </div>
    )}
    </LayoutGroup>
  );
};
