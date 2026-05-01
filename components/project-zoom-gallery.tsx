"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Project } from '@/types/project';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';
import { Grid2X2, List } from 'lucide-react';

const EXPAND_DURATION = 1500; // ms — 열기/닫기 애니메이션 속도
const SCROLL_BACK_DURATION = 2500; // ms — 닫을 때 커버사진 복귀 속도
const TEXT_PADDING = 'p-3 md:p-8'; // 텍스트 슬라이드 안쪽 여백

// 레이아웃 비율 — 커버/슬라이드 너비와 좌우 여백은 함께 조정해야 함
// 닫힌 상태 중앙정렬: MARGIN_W*2 + PHOTO_W = 100% 이면 완벽 중앙
const MAX_CONTAINER_WIDTH = '1920px';
const PHOTO_W = 'w-[70%] md:w-[35%] min-w-[70%] md:min-w-[35%] max-w-[70%] md:max-w-[35%]';
const MARGIN_W = 'w-[15%] md:w-[25%] min-w-[15%] md:min-w-[25%] max-w-[15%] md:max-w-[25%]';

// 패널 내 폰트 — cqw = 패널 너비의 1% (containerType: inline-size 기준)
const FONT_TITLE        = 'clamp(0.6rem, 6cqw, 12pt)';
const FONT_META         = 'clamp(0.4rem, 3cqw, 10pt)';
const FONT_DESC         = 'clamp(0.5rem, 1.5cqw, 8pt)';
const FONT_BLOCK_TITLE  = 'clamp(0.8rem, 3.5cqw, 16pt)';  // 콘텐츠 블록 제목
const FONT_BLOCK_BODY   = 'clamp(0.6rem, 2.2cqw, 12pt)';  // 콘텐츠 블록 본문

interface ProjectRowProps {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  layoutId: string;
}

const ProjectRow = ({ project, isExpanded, onToggle, layoutId }: ProjectRowProps) => {
  const { language } = useLanguage();
  const title = language === 'ko' ? project.titleKo : (project.title || project.titleKo);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (Math.abs(e.clientX - dragStartPos.current.x) > 5 || Math.abs(e.clientY - dragStartPos.current.y) > 5)
      isDragging.current = true;
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
      e.preventDefault();
      el.scrollLeft += e.deltaY + e.deltaX;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isExpanded]);

  return (
    <div
      id={`project-${project.id}`}
      className="w-full mx-auto flex flex-col items-center mb-[5px]"
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
        onClick={handleContainerClick}
      >
        {/* Left Content (Margin Space: 15% on mobile, 25% on desktop) */}
        <div 
          className={`shrink-0 relative transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${MARGIN_W} ${
            isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ transitionDuration: `${EXPAND_DURATION}ms` }}
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

            <div className="flex flex-col space-y-1 uppercase tracking-[0.2em] text-gray-500 font-bold border-r-[2px] md:border-r-[3px] border-black pr-2 md:pr-4 w-full"
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
          className={`shrink-0 relative aspect-[4/3] transition-all ease-[cubic-bezier(0.4,0,0.2,1)] ${PHOTO_W} ${
            isExpanded
              ? 'shadow-xl'
              : 'cursor-pointer shadow-sm hover:shadow-md hover:opacity-95'
          }`}
          style={{ transitionDuration: `${EXPAND_DURATION}ms` }}
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
            <div className={`shrink-0 relative ${MARGIN_W} h-full transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`} style={{ transitionDuration: `${EXPAND_DURATION}ms` }}>
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
              <div key={i} className={`shrink-0 aspect-[4/3] relative shadow-lg bg-gray-100 ${PHOTO_W} transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`} style={{ transitionDuration: `${EXPAND_DURATION}ms` }}>
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
              <div key={`content-${i}`} className={`shrink-0 aspect-[4/3] relative ${PHOTO_W} transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`} style={{ transitionDuration: `${EXPAND_DURATION}ms` }}>
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
           <div className={`shrink-0 h-full ${MARGIN_W} transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`} style={{ transitionDuration: `${EXPAND_DURATION}ms` }} />
      </div>
    </div>
  );
};

export const ProjectZoomGallery = ({ projects }: { projects: Project[] }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('list');
  const [fading, setFading] = useState(false);
  const savedExpandedIds = useRef<Set<string>>(new Set());
  const { language } = useLanguage();

  const switchView = (mode: 'list' | 'grid') => {
    if (mode === displayMode) return;
    if (mode === 'grid') {
      savedExpandedIds.current = expandedIds;
      setExpandedIds(new Set());
      setDisplayMode(mode);
      setViewMode(mode);
    } else {
      setFading(true);
      setTimeout(() => {
        setDisplayMode(mode);
        setViewMode(mode);
        setFading(false);
        setTimeout(() => setExpandedIds(savedExpandedIds.current), 600);
      }, 300);
    }
  };

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGridClick = (id: string) => {
    setViewMode('list');
    setDisplayMode('list');
    setExpandedIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      document.getElementById(`project-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <LayoutGroup>
    <div className="w-full relative flex flex-col items-center">
      {/* View Mode Toggle */}
      <div className="fixed right-6 z-40" style={{ top: 'calc(var(--header-h, 64px) + 8px)' }}>
        <button
          onClick={() => switchView(viewMode === 'list' ? 'grid' : 'list')}
          className="p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 text-gray-600 hover:text-black transition-colors"
          aria-label="Toggle view"
        >
          {viewMode === 'list' ? <Grid2X2 size={20} /> : <List size={20} />}
        </button>
      </div>

      <div className="w-full flex flex-col items-center pb-[20px]" style={{ opacity: fading ? 0 : 1, transition: 'opacity 300ms ease' }}>
        {displayMode === 'list' ? (
          projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              isExpanded={expandedIds.has(project.id)}
              onToggle={() => handleToggle(project.id)}
              layoutId={project.id}
            />
          ))
        ) : (
          <div className="w-full max-w-screen-2xl px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pb-[100px] animate-in fade-in duration-500">
            {projects.map((project) => {
              const title = language === 'ko' ? project.titleKo : (project.title || project.titleKo);
              return (
                <motion.button
                  key={project.id}
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
    </LayoutGroup>
  );
};
