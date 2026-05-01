"use client";

import React, { useState, useRef, useCallback, useEffect, CSSProperties } from 'react';
import { Project } from '@/types/project';
import Image from 'next/image';
import { useLanguage } from '@/lib/language-context';

// --- ANIMATION SETTINGS ---
const ZOOM_DURATION = 1500;
const MODAL_DELAY = 10;
const MODAL_FADE_IN = 800;
const MODAL_FADE_OUT = 400;
const OVERLAY_OPACITY = 0;
// Buffer removed because it alters the image crop ratio and causes vertical misalignment
const MODAL_HEIGHT_BUFFER = 0; 
const MODAL_SCALE_FACTOR = 1.005; // Slight scale up to cover sub-pixel background card edges

interface ZoomCardProps {
  project: Project;
  onCardClick: (project: Project, rect: DOMRect, el: HTMLButtonElement) => void;
  isVisible: boolean;
}

const ProjectZoomCard: React.FC<ZoomCardProps> = ({ project, onCardClick, isVisible }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { language } = useLanguage();

  const title = language === 'ko' ? project.titleKo : project.title;

  const handleClick = () => {
    if (ref.current) {
      onCardClick(project, ref.current.getBoundingClientRect(), ref.current);
    }
  };

  return (
    <button
      ref={ref}
      className={`relative w-full aspect-[4/3] overflow-hidden p-0 border-0 bg-gray-100 group transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClick}
      style={{ visibility: isVisible ? 'visible' : 'hidden', touchAction: 'manipulation', display: 'block' }}
    >
      <Image
        src={project.image}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <p className="text-white text-sm font-medium">{title}</p>
      </div>
    </button>
  );
};

export const ProjectZoomGallery = ({ projects }: { projects: Project[] }) => {
  const { language } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<{ project: Project; rect: DOMRect; vw: number; vh: number; headerHeight: number; vpOffsetX: number; vpOffsetY: number; scrollX: number; scrollY: number; originX: number; originY: number; shouldZoom: boolean } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRect, setModalRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalInnerRef = useRef<HTMLDivElement>(null);
  const selectedCardElRef = useRef<HTMLButtonElement | null>(null);
  const originPathnameRef = useRef<string>('/');
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const textDragStateRef = useRef<{ active: boolean; pointerId: number | null; startY: number; startScrollTop: number }>(
    { active: false, pointerId: null, startY: 0, startScrollTop: 0 }
  );

  const handleTextPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    textDragStateRef.current = { active: true, pointerId: e.pointerId, startY: e.clientY, startScrollTop: e.currentTarget.scrollTop };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleTextPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = textDragStateRef.current;
    if (!s.active || s.pointerId !== e.pointerId) return;
    e.currentTarget.scrollTop = s.startScrollTop - (e.clientY - s.startY);
  };
  const handleTextPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (textDragStateRef.current.pointerId !== e.pointerId) return;
    textDragStateRef.current = { active: false, pointerId: null, startY: 0, startScrollTop: 0 };
  };

  useEffect(() => {
    if (isModalOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isModalOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleCardClick = (project: Project, rect: DOMRect, el: HTMLButtonElement) => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    // Get container rect to calculate origin relative to the container itself
    const containerRect = containerRef.current?.getBoundingClientRect();
    const containerLeft = containerRect ? containerRect.left : 0;
    const containerTop = containerRect ? containerRect.top : 0;

    // originX/Y must be relative to the element we are applying transform-origin to (containerRef)
    const originX = rect.left - containerLeft + (rect.width / 2);
    const originY = rect.top - containerTop + (rect.height / 2);
    const headerHVar = getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    const headerHeight = headerHVar ? parseFloat(headerHVar) : (document.querySelector('header')?.offsetHeight ?? 64);

    selectedCardElRef.current = el;
    setModalRect(null);
    setSelectedProject({ project, rect, vw, vh, headerHeight, vpOffsetX: 0, vpOffsetY: 0, scrollX, scrollY, originX, originY, shouldZoom: true });
    setIsZoomed(true);

    originPathnameRef.current = window.location.pathname;
    window.history.pushState(null, '', `/projects/${project.id}`);

    setTimeout(() => {
      // Measure the card's actual on-screen rect AFTER zoom transform settled.
      // Modal aligns to this measurement instead of pre-calculating from math.
      if (selectedCardElRef.current) {
        const r = selectedCardElRef.current.getBoundingClientRect();
        setModalRect({ left: r.left, top: r.top, width: r.width, height: r.height });
      }
      setIsModalOpen(true);
    }, ZOOM_DURATION + MODAL_DELAY);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    window.history.pushState(null, '', originPathnameRef.current);

    setTimeout(() => {
      setIsZoomed(false);
      setTimeout(() => {
        setSelectedProject(null);
        setModalRect(null);
        selectedCardElRef.current = null;
      }, ZOOM_DURATION);
    }, MODAL_FADE_OUT);
  };

  const getContainerStyle = useCallback((): CSSProperties => {
    if (!selectedProject) {
      return {
        transition: `transform ${ZOOM_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transform: 'translate(0px, 0px) scale(1)',
        transformOrigin: '50% 50%',
      };
    }

    const { rect, vw, vh, headerHeight, originX, originY } = selectedProject;
    const isDesktop = vw >= 1024;
    const targetScale = isDesktop ? (vw * 0.4 / rect.width) : (vw / rect.width);

    const currentViewportX = rect.left + (rect.width / 2);
    const currentViewportY = rect.top + (rect.height / 2);
    const targetViewportX = isDesktop ? (vw * 0.3) : (vw / 2);
    // 헤더 아래 콘텐츠 영역의 수직 중앙
    const targetViewportY = headerHeight + (vh - headerHeight) / 2;

    const rawTranslateX = targetViewportX - currentViewportX;
    const rawTranslateY = targetViewportY - currentViewportY;

    const translateX = rawTranslateX / targetScale;
    const translateY = rawTranslateY / targetScale;

    if (!isZoomed) {
      return {
        position: 'relative',
        zIndex: 1,
        transform: 'translate(0px, 0px) scale(1)',
        transition: `transform ${ZOOM_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        transformOrigin: `${originX}px ${originY}px`,
      };
    }

    return {
      position: 'relative',
      zIndex: 1,
      transform: `scale(${targetScale}) translate(${translateX}px, ${translateY}px)`,
      transition: `transform ${ZOOM_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      transformOrigin: `${originX}px ${originY}px`,
    };
  }, [selectedProject, isZoomed]);

  const getModalStyle = useCallback((): CSSProperties => {
    if (!selectedProject) return { display: 'none' };

    const { vw } = selectedProject;
    // Use the measured post-zoom rect when available; until then keep the modal
    // hidden (it's still mounted but invisible) so we never flash a stale position.
    const top = modalRect ? modalRect.top : 0;
    const height = modalRect ? modalRect.height : 0;

    return {
      position: 'fixed',
      left: `0px`,
      width: `${vw}px`,
      top: `${top}px`,
      transform: `scale(${MODAL_SCALE_FACTOR})`,
      height: `${height}px`,
      opacity: isModalOpen && modalRect ? 1 : 0,
      pointerEvents: isModalOpen && modalRect ? 'auto' : 'none',
      transition: `opacity ${isModalOpen ? MODAL_FADE_IN : MODAL_FADE_OUT}ms ease-in-out`,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: 'white',
      overflow: 'hidden',
    };
  }, [selectedProject, isModalOpen, modalRect]);

  return (
    <>
      <div 
        ref={containerRef}
        style={getContainerStyle()}
        className="w-full flex flex-col items-center"
      >
        <div className="relative w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 justify-items-center">
          {projects.map((project) => (
            <ProjectZoomCard
              key={project.id}
              project={project}
              onCardClick={handleCardClick}
              isVisible={true}
            />
          ))}
        </div>
      </div>

      {selectedProject && (
        <div
          className="fixed inset-0 z-40"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${OVERLAY_OPACITY / 100})`,
            opacity: isModalOpen ? 1 : 0,
            pointerEvents: isModalOpen ? 'auto' : 'none',
            transition: `opacity ${isModalOpen ? MODAL_FADE_IN : MODAL_FADE_OUT}ms ease-in-out`,
            touchAction: isModalOpen ? 'none' : 'auto',
          }}
          onClick={handleCloseModal}
        >
          <div
            ref={modalInnerRef}
            style={getModalStyle()}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseUp}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex h-full overflow-x-auto overflow-y-hidden w-full hide-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
              style={{ touchAction: 'pan-x' }}
            >
              {selectedProject.vw >= 1024 && (
                <div
                  className="h-full flex-shrink-0 flex flex-col justify-start px-5 bg-white border-r border-gray-100"
                  style={{ width: modalRect ? `${modalRect.left}px` : '10%', paddingTop: '2.5rem' }}
                >
                  <h2 className="text-[clamp(10px,0.9vw,16px)] font-black tracking-tighter leading-tight mb-5 text-right break-keep">
                    {language === 'ko' ? selectedProject.project.titleKo : selectedProject.project.title}
                  </h2>
                  <div className="space-y-1.5 text-[clamp(8px,0.7vw,13px)] uppercase tracking-[0.15em] text-zinc-400 font-bold text-right">
                    {(language === 'ko' ? selectedProject.project.locationKo : selectedProject.project.location) && (
                      <p>{language === 'ko' ? selectedProject.project.locationKo : selectedProject.project.location}</p>
                    )}
                    {selectedProject.project.year && <p>{selectedProject.project.year}</p>}
                    {selectedProject.project.area && <p>{selectedProject.project.area}</p>}
                    {(language === 'ko' ? selectedProject.project.useKo : selectedProject.project.use) && (
                      <p>{language === 'ko' ? selectedProject.project.useKo : selectedProject.project.use}</p>
                    )}
                  </div>
                </div>
              )}

              <div
                className="flex-shrink-0 overflow-hidden self-center relative"
                style={{
                  width: modalRect
                    ? `${modalRect.width}px`
                    : (selectedProject.vw < 1024 ? `${selectedProject.vw}px` : '40%'),
                  height: '100%',
                }}
              >
                <Image
                  src={selectedProject.project.image}
                  alt={language === 'ko' ? selectedProject.project.titleKo : (selectedProject.project.title || selectedProject.project.titleKo)}
                  fill
                  className="object-cover"
                  draggable={false}
                />

                {selectedProject.vw < 1024 && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/20">
                    <div className="text-white text-xs font-mono uppercase tracking-widest bg-black/40 px-3 py-1 backdrop-blur-sm">
                      {language === 'ko' ? selectedProject.project.titleKo : (selectedProject.project.title || selectedProject.project.titleKo)}
                    </div>
                  </div>
                )}
              </div>

              {/* content 배열 순서대로 인터리브 슬라이드 */}
              {selectedProject.project.content
                ? selectedProject.project.content
                    .filter(b => !(b.type === 'image' && b.src === selectedProject.project.image))
                    .map((block, i) =>
                      block.type === 'text' ? (
                        <div
                          key={i}
                          className="flex-none h-full w-[250px] overflow-y-hidden hide-scrollbar bg-white border-r border-zinc-100"
                          style={{ cursor: 'grab', touchAction: 'none' }}
                          onPointerDown={handleTextPointerDown}
                          onPointerMove={handleTextPointerMove}
                          onPointerUp={handleTextPointerUp}
                          onPointerCancel={handleTextPointerUp}
                          onPointerLeave={handleTextPointerUp}
                        >
                          <div className="p-8 h-full">
                            {block.title && (
                              <h3 className="font-bold tracking-tight text-foreground/90 mb-4 text-[clamp(10px,0.9vw,16px)]">
                                {language === 'ko' ? block.title.ko : block.title.en}
                              </h3>
                            )}
                            <p className="text-[clamp(9px,0.8vw,14px)] text-zinc-500 leading-relaxed font-light whitespace-pre-wrap">
                              {language === 'ko' ? block.body.ko : block.body.en}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div key={i} className="flex-none h-full overflow-hidden border-r border-zinc-100">
                          <img src={block.src} alt={block.alt ?? ''} className="h-full w-auto object-contain block" draggable={false} />
                        </div>
                      )
                    )
                : selectedProject.project.images
                    ?.filter(img => img !== selectedProject.project.image)
                    .map((img, i) => (
                      <div key={i} className="flex-none h-full overflow-hidden border-r border-zinc-100">
                        <img src={img} alt="" className="h-full w-auto object-contain block" draggable={false} />
                      </div>
                    ))
              }

              {/* END 슬라이드 */}
              <div className="flex-none w-[20vw] h-full bg-zinc-50 flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-[2em] text-zinc-300 rotate-90 font-bold opacity-30">END</span>
              </div>
            </div>

            {/* Folded Corner Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-0 left-0 z-50 w-8 h-8 transition-transform hover:scale-110 focus:outline-none"
              aria-label="Close"
              style={{
                background: 'linear-gradient(135deg, white 50%, #f3f4f6 50%)',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
              }}
            >
              <div 
                className="absolute inset-0" 
                style={{
                  background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.05) 50%, transparent 60%)'
                }}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
