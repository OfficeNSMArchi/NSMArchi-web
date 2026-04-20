"use client"

import React, { useRef, useEffect, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Project } from '@/types/project'
import { useRouter } from "next/navigation";

interface ProjectDetailViewProps {
  project: Project;
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage()

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.back();
    }, 1000); 
  };

  const dragStateRef = useRef<{
    active: boolean
    pointerId: number | null
    startY: number
    startScrollTop: number
  }>({ active: false, pointerId: null, startY: 0, startScrollTop: 0 })

  useEffect(() => {
    setIsVisible(true);
  }, [project]);

  const arrowHoldRef = useRef<number | null>(null)
  const scrollTextBy = (el: HTMLDivElement, dy: number, smooth = true) => {
    if (smooth) el.scrollBy({ top: dy, behavior: "smooth" })
    else el.scrollTop += dy
  }

  const startArrowHold = (el: HTMLDivElement, dy: number) => {
    if (arrowHoldRef.current) window.clearInterval(arrowHoldRef.current)
    scrollTextBy(el, dy, true)
    arrowHoldRef.current = window.setInterval(() => scrollTextBy(el, dy, false), 50) as unknown as number
  }

  const stopArrowHold = () => {
    if (arrowHoldRef.current) {
      window.clearInterval(arrowHoldRef.current)
      arrowHoldRef.current = null
    }
  }

  const handleWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    const dx = e.deltaX ?? 0
    const dy = e.deltaY ?? 0
    const raw = Math.abs(dx) > Math.abs(dy) ? dx : dy
    if (raw === 0) return
    const native = e.nativeEvent
    const deltaMode = native?.deltaMode ?? 0
    const normalized = deltaMode === 1 ? raw * 16 : deltaMode === 2 ? raw * window.innerHeight : raw
    e.preventDefault()
    el.scrollLeft += normalized * 2
  }

  const handleTextPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    const el = e.currentTarget
    dragStateRef.current = { active: true, pointerId: e.pointerId, startY: e.clientY, startScrollTop: el.scrollTop }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleTextPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current
    if (!state.active || state.pointerId !== e.pointerId) return
    const el = e.currentTarget
    const dy = e.clientY - state.startY
    el.scrollTop = state.startScrollTop - dy
  }

  const endTextDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current
    if (state.pointerId !== e.pointerId) return
    dragStateRef.current = { active: false, pointerId: null, startY: 0, startScrollTop: 0 }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      if (direction === 'left') scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      else scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const companyBadge: Record<string, string> = { ndb: "N", snp: "S", metalogic: "M" };
  const companyLabel = Array.isArray(project.companies)
    ? project.companies.map((c: string) => companyBadge[c] ?? c).join("")
    : "";

  const mainTitle = t(project.titleKo ?? project.title, project.title)

  // --- 핵심: 슬라이드 조립 로직 ---
  const slides: any[] = [
    { type: "project-cover" }, // 1. 가상 표지 슬라이드 추가
    ...(project.image ? [{ type: "image", src: project.image, alt: "Cover" }] : []), // 2. 커버 이미지
    ...((project.content as any[]) || []).filter(s => s.src !== project.image) // 3. 나머지 원본 콘텐츠
  ]

  const firstTextIndex = slides.findIndex((s: any) => s?.type === "text" || s?.type === "project-cover")

  return (
    <div 
      className={`relative w-full h-full max-h-full min-h-0 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-1000 ease-out 
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
    >
      <button onClick={handleClose} className="absolute right-4 top-4 z-50 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
        <X className="w-6 h-6" />
      </button>

      <button onClick={() => scroll('left')} className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden md:block text-white hover:scale-110 active:scale-95 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
        <ChevronLeft className="h-10 w-10 stroke-[2.5]" />
      </button>
      <button onClick={() => scroll('right')} className="absolute right-6 top-1/2 -translate-y-1/2 z-40 hidden md:block text-white hover:scale-110 active:scale-95 drop-shadow-[0_0_8_px_rgba(0,0,0,0.8)]">
        <ChevronRight className="h-10 w-10 stroke-[2.5]" />
      </button>

      {/* Desktop view */}
      <div 
        ref={scrollRef}
        onWheelCapture={handleWheelCapture}
        className="hidden md:flex flex-row flex-nowrap h-full max-h-full min-h-0 overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        {slides.map((slide: any, index: number) => {
          if (slide.type === "text" || slide.type === "project-cover") {
            const isCover = slide.type === "project-cover"
            const slideTitle = slide.title ? t(slide.title.ko, slide.title.en) : undefined
            const slideBody = slide.body ? t(slide.body.ko, slide.body.en) : undefined

            return (
              <div key={`text-${index}`} data-slide="text" className="relative flex-none h-full w-[250px] max-h-full min-h-0 overflow-y-auto no-scrollbar bg-white dark:bg-zinc-950 border-x border-zinc-100 dark:border-zinc-800">
                <div className="pointer-events-auto absolute right-4 top-4 bottom-4 z-10 hidden md:flex flex-col justify-between">
                  <button type="button" className="grid h-8 w-8 place-items-center text-zinc-300 hover:text-zinc-400" onClick={(e) => {
                    const scroller = e.currentTarget.closest('[data-slide="text"]')?.querySelector('[data-text-scroller="true"]') as HTMLDivElement | null
                    if (scroller) scrollTextBy(scroller, -180, true)
                  }} onPointerDown={(e) => {
                    const scroller = e.currentTarget.closest('[data-slide="text"]')?.querySelector('[data-text-scroller="true"]') as HTMLDivElement | null
                    if (scroller) startArrowHold(scroller, -22)
                  }} onPointerUp={stopArrowHold} onPointerLeave={stopArrowHold}>
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <button type="button" className="grid h-8 w-8 place-items-center text-zinc-300 hover:text-zinc-400" onClick={(e) => {
                    const scroller = e.currentTarget.closest('[data-slide="text"]')?.querySelector('[data-text-scroller="true"]') as HTMLDivElement | null
                    if (scroller) scrollTextBy(scroller, 180, true)
                  }} onPointerDown={(e) => {
                    const scroller = e.currentTarget.closest('[data-slide="text"]')?.querySelector('[data-text-scroller="true"]') as HTMLDivElement | null
                    if (scroller) startArrowHold(scroller, 22)
                  }} onPointerUp={stopArrowHold} onPointerLeave={stopArrowHold}>
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
                
                <div
                  ref={index === firstTextIndex ? textPanelRef : undefined}
                  data-text-scroller="true"
                  className={`h-full min-h-0 overflow-y-hidden p-16 pr-20 ${isCover ? "text-right" : "text-left"}`}
                  onPointerDown={handleTextPointerDown}
                  onPointerMove={handleTextPointerMove}
                  onPointerUp={endTextDrag}
                  onPointerCancel={endTextDrag}
                  onPointerLeave={endTextDrag}
                  style={{ cursor: "grab", touchAction: "none" }}
                >
                  {/* 1. 표지 슬라이드: 제목과 제원만 노출 */}
                  {isCover ? (
                    <>
                      <p className="text-[10px] font-bold text-blue-600 mb-4 uppercase tracking-[0.3em]">{companyLabel}</p>
                      <h2 className="text-2xl md:text-xl font-black tracking-tighter leading-tight mb-10">{mainTitle}</h2>
                      <div className="mb-12 space-y-3 text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
                        <p>{t(project.locationKo, project.location)}</p>
                        <p>{project.year}</p>
                        <p>{project.area}</p>
                        <p>{t(project.useKo, project.use)}</p>
                      </div>
                    </>
                  ) : (
                    /* 2. 일반 텍스트 슬라이드: 본문 설명글만 노출 */
                    <>
                      {slideTitle && <h3 className="font-bold tracking-tight text-foreground/90 mb-4 text-xl">{slideTitle}</h3>}
                      {slideBody && <p className="text-base md:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light whitespace-pre-wrap">{slideBody}</p>}
                    </>
                  )}
                </div>
              </div>
            )
          }
          return (
            <div key={`img-${index}`} className="flex-none h-full max-h-full flex items-center justify-center border-r border-zinc-100 dark:border-zinc-800 overflow-hidden">
              <img src={slide.src} className="block h-full w-auto object-contain select-none" alt={slide.alt ?? "image"} />
            </div>
          )
        })}
        <div className="flex-none w-[25vw] h-full bg-zinc-50 dark:bg-zinc-900/10 flex items-center justify-center">
           <span className="text-[10px] uppercase tracking-[2em] text-zinc-300 rotate-90 font-bold opacity-30">END OF PROJECT</span>
        </div>
      </div>
    </div>
  );
}