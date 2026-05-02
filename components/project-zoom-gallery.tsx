"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Project } from '@/types/project';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';
import { LAYOUT_MAX_W, LAYOUT_PX } from '@/lib/layout';
import { useViewMode } from '@/lib/view-mode-context';
import { List, Grid2X2 } from 'lucide-react';

const ScrollWheelIcon = ({ vertical = false }: { vertical?: boolean }) => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* 휠 — 세로 타원, 중심 (22,22) */}
    <rect x="15" y="12" width="14" height="20" rx="7" />
    <line x1="22" y1="16" x2="22" y2="20" />
    {/* 꺾쇠 — 세로 모드시 90도 회전 */}
    <g transform={vertical ? 'rotate(90, 22, 22)' : undefined}>
      <polyline points="10,16 4,22 10,28" />
      <polyline points="34,16 40,22 34,28" />
    </g>
  </svg>
);

const EXPAND_DURATION = 1500; // ms — 열기/닫기 애니메이션 속도
const SCROLL_BACK_DURATION = 2500; // ms — 닫을 때 커버사진 복귀 속도
const GRID_TO_LIST_SCROLL_DURATION = 2500; // ms — 그리드→리스트 전환 후 해당 프로젝트로 스크롤 속도
const TEXT_PADDING = 'p-3 md:p-8'; // 텍스트 슬라이드 안쪽 여백

// 레이아웃 비율 — globals.css의 --photo-w, --margin-w 와 단일 소스로 연동
// 닫힌 상태 중앙정렬: --margin-w*2 + --photo-w = 100% 이면 완벽 중앙
const MAX_CONTAINER_WIDTH = '1920px';
const PHOTO_STYLE = { width: 'var(--photo-w)', minWidth: 'var(--photo-w)', maxWidth: 'var(--photo-w)' };
const MARGIN_STYLE = { width: 'var(--margin-w)', minWidth: 'var(--margin-w)', maxWidth: 'var(--margin-w)' };
const TEXT_W_RATIO = 0.7; // 텍스트 블록 너비 = --photo-w * 이 비율
const TEXT_STYLE = { width: `calc(var(--photo-w) * ${TEXT_W_RATIO})`, minWidth: `calc(var(--photo-w) * ${TEXT_W_RATIO})`, maxWidth: `calc(var(--photo-w) * ${TEXT_W_RATIO})` };

// 패널 내 폰트 — cqw = 패널 너비의 1% (containerType: inline-size 기준)
const FONT_TITLE        = 'clamp(0.4rem, 3cqw, 12pt)';
const FONT_META         = 'clamp(0.3rem, 2.5cqw, 10pt)';
const FONT_DESC         = 'clamp(0.3rem, 2.5cqw, 8pt)';
const FONT_BLOCK_TITLE  = 'clamp(0.2rem, 3cqw, 16pt)';  // 콘텐츠 블록 제목
const FONT_BLOCK_BODY   = 'clamp(0.2rem, 2.5cqw, 12pt)';  // 콘텐츠 블록 본문

interface ProjectRowProps {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
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
  const handleContainerClick = () => {
    if (isExpanded && !isDragging.current) onToggle();
  };
  const handleCoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging.current) onToggle();
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
      className="relative w-full mx-auto flex flex-col items-center mb-[5px]"
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
        className={`flex items-stretch transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded
            ? 'overflow-x-auto hide-scrollbar cursor-pointer'
            : 'overflow-hidden w-full'
        }`}
        style={{
          transitionDuration: `${EXPAND_DURATION}ms`,
          ...(isExpanded ? { width: '100vw' } : {}),
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleContainerClick}
      >
        {/* Left Content (Margin Space: 15% on mobile, 25% on desktop) */}
        <div
          className={`shrink-0 relative transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ ...MARGIN_STYLE, transitionDuration: `${EXPAND_DURATION}ms` }}
        >
          <div
            className="absolute inset-0 flex flex-col items-end justify-center text-right space-y-4 md:space-y-6 px-2 md:px-8 overflow-y-auto hide-scrollbar py-4"
            style={{ containerType: 'inline-size' }}
          >
            <h2
              className="font-bold font-mono tracking-tighter uppercase leading-tight break-words w-full"
              style={{ fontSize: FONT_TITLE }}
            >
              {title}
            </h2>

            <div className="flex flex-col space-y-1 uppercase tracking-[0.2em] text-gray-500 font-bold w-full"
                 style={{ fontSize: FONT_META }}
            >
               <p className="break-words">{language === 'ko' ? project.locationKo : project.location}</p>
               <p>{project.year}</p>
               <p>{project.area}</p>
               <p className="break-words">{language === 'ko' ? project.useKo : project.use}</p>
            </div>
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
          style={{ ...PHOTO_STYLE, transitionDuration: `${EXPAND_DURATION}ms` }}
          onClick={handleCoverClick}
        >
           <Image
            src={project.image}
            alt={title}
            fill
            sizes="(max-width: 768px) 70vw, 30vw"
            className="object-cover"
            draggable={false}
            priority
          />
          {!isExpanded && (
            <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4 md:p-10">
              <p
                className="text-white font-bold tracking-tight uppercase drop-shadow-lg"
                style={{ fontSize: 'clamp(1.125rem, 3vw, 24pt)' }}
              >
                {title}
              </p>
            </div>
          )}
        </motion.div>

        {/* Right Content */}
        {(!project.content || project.content.length === 0) ? (
          <>
            {/* Description in the right margin space (15% md:25%) */}
            <div className={`shrink-0 relative h-full transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`} style={{ ...MARGIN_STYLE, transitionDuration: `${EXPAND_DURATION}ms` }}>
              <div
                className="absolute inset-0 flex flex-col justify-center px-2 md:px-8 overflow-y-auto hide-scrollbar py-4"
                style={{ containerType: 'inline-size' }}
              >
                <p
                  className="text-gray-600 leading-relaxed md:leading-loose whitespace-pre-wrap font-light break-words w-full"
                  style={{ fontSize: FONT_DESC }}
                >
                  {language === 'ko' ? project.descriptionKo : (project.description || project.descriptionKo)}
                </p>
              </div>
            </div>
            
            {/* Render additional images if any */}
            {project.images?.filter(img => img !== project.image).map((img, i) => (
              <div key={i} className={`shrink-0 aspect-[4/3] relative shadow-lg bg-gray-100 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`} style={{ ...PHOTO_STYLE, transitionDuration: `${EXPAND_DURATION}ms` }}>
                  <Image src={img} alt={`${title} ${i}`} fill className="object-contain md:object-cover" />
              </div>
            ))}
          </>
        ) : (
          <>
            {/* When content exists, skip description and simple images, just render content blocks */}
            {project.content
              .filter(block => !(block.type === 'image' && block.src === project.image))
              .map((block, i) => (
              <div key={`content-${i}`} className={`shrink-0 aspect-[4/3] relative transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`} style={{
                ...(block.type === 'text' ? TEXT_STYLE : PHOTO_STYLE),
                transitionDuration: `${EXPAND_DURATION}ms`,
              }}>
                  <div className="absolute inset-0 flex flex-col justify-center overflow-hidden" style={{ containerType: 'inline-size' }}>
                    {block.type === 'text' && (
                      <div className={`space-y-4 md:space-y-6 ${TEXT_PADDING}`}>
                        {block.title && (
                          <h3
                            className="font-bold uppercase tracking-tight"
                            style={{ fontSize: FONT_BLOCK_TITLE }}
                          >
                            {language === 'ko' ? block.title.ko : block.title.en}
                          </h3>
                        )}
                        {block.body && (
                          <p
                            className="text-gray-600 leading-relaxed whitespace-pre-wrap font-light"
                            style={{ fontSize: FONT_BLOCK_BODY }}
                          >
                            {language === 'ko' ? block.body.ko : block.body.en}
                          </p>
                        )}
                      </div>
                    )}
                    {block.type === 'image' && (
                      <div className="relative w-full h-full">
                          <Image src={block.src} alt={block.alt || "Detail"} fill className="object-cover" />
                      </div>
                    )}
                  </div>
              </div>
            ))}
          </>
        )}
        
        {/* Spacer at the end for comfortable scrolling */}
           <div className={`shrink-0 h-full transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`} style={{ ...MARGIN_STYLE, transitionDuration: `${EXPAND_DURATION}ms` }} />
      </div>

    </div>
  );
};

export const ProjectZoomGallery = ({ projects }: { projects: Project[] }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { viewMode, setViewMode, scrollMode, setScrollMode } = useViewMode();
  const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('list');
  const [fading, setFading] = useState(false);
  const savedExpandedIds = useRef<Set<string>>(new Set());
  const { language } = useLanguage();


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
      setExpandedIds(new Set());
      setDisplayMode(mode);
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
      }, 1200);
    } else {
      setFading(true);
      setTimeout(() => {
        setDisplayMode(mode);
        setFading(false);
        setTimeout(() => setExpandedIds(savedExpandedIds.current), 600);
      }, 300);
    }
  }, [displayMode, expandedIds, projects]);

  useEffect(() => {
    switchView(viewMode);
  }, [viewMode, switchView]);

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGridClick = (id: string) => {
    setFading(true);
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

  const anyExpanded = expandedIds.size > 0 && displayMode === 'list';

  const [controlBottom, setControlBottom] = useState(24);
  useEffect(() => {
    const update = () => {
      const footer = document.getElementById('site-footer');
      if (!footer) return;
      const footerTop = footer.getBoundingClientRect().top;
      setControlBottom(prev => {
        if (prev === 24 && footerTop < window.innerHeight - 10) return footer.offsetHeight + 24;
        if (prev !== 24 && footerTop > window.innerHeight + 10) return 24;
        return prev;
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <LayoutGroup>
    <div className="w-full relative flex flex-col items-center">
<div className="w-full flex flex-col items-center pb-[20px]" style={{ opacity: fading ? 0 : 1, transition: 'opacity 300ms ease' }}>
        {displayMode === 'list' ? (
          projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              isExpanded={expandedIds.has(project.id)}
              onToggle={() => handleToggle(project.id)}
              layoutId={project.id}
              scrollMode={scrollMode}
            />
          ))
        ) : (
          <div className={`w-full grid grid-cols-2 lg:grid-cols-3 gap-2 pb-[100px] animate-in fade-in duration-500 ${LAYOUT_MAX_W} ${LAYOUT_PX}`}>
            {projects.map((project) => {
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
                  <Image
                    src={project.image}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white text-lg font-bold tracking-tight uppercase">{title}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {/* 하단 고정 컨트롤 — 커버 중앙 X, 뷰포트 하단 */}
    {/* 하단 고정 컨트롤 — 커버 중앙 X, 뷰포트 하단 */}
    <div
      className="flex fixed -translate-x-1/2 z-40 flex-col items-center gap-3 "
      style={{ left: 'calc(var(--margin-w) + var(--photo-w) / 2)', bottom: controlBottom }}
    >
      {/* 스크롤 방향 토글 — 데스크탑 + 확장시만 노출 */}
      <button
        onClick={() => setScrollMode(scrollMode === 'horizontal' ? 'vertical' : 'horizontal')}
        className={`hidden md:flex transition-opacity duration-300 ${anyExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ color: 'white', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
        aria-label="스크롤 방향 전환"
      >
        <ScrollWheelIcon vertical={scrollMode === 'vertical'} />
      </button>
      {/* 뷰 전환 — 데스크탑 전용 */}
      <button
        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
        className="hidden md:flex p-1"
        style={{ color: 'white', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
        aria-label="뷰 전환"
      >
        {viewMode === 'list' ? <Grid2X2 size={20} /> : <List size={20} />}
      </button>
    </div>
    </LayoutGroup>
  );
};
