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
  const { language, setLanguage, t } = useLanguage()

  // 닫기 로직: 애니메이션(1초)을 기다렸다가 뒤로 가기 실행
  const handleClose = () => {
    console.log("닫기 프로세스 시작");
    setIsVisible(false); // 페이드 아웃 애니메이션 시작
    setTimeout(() => {
      router.back(); // 애니메이션이 끝나는 1초 뒤에 실제로 페이지 이동
    }, 1000); 
  };

  const dragStateRef = useRef<{
    active: boolean
    pointerId: number | null
    startY: number
    startScrollTop: number
  }>({ active: false, pointerId: null, startY: 0, startScrollTop: 0 })

  useEffect(() => {
    // 마운트 시 스르륵 나타나게 설정
    setIsVisible(true);

    const el = scrollRef.current;
    if (!el) return;

    const textEl = textPanelRef.current
    if (!textEl) return

    const preventTextWheel = (e: WheelEvent) => {
      e.preventDefault()
    }

    textEl.addEventListener("wheel", preventTextWheel, { passive: false })
    return () => textEl.removeEventListener("wheel", preventTextWheel as any)
  }, [project]);

  const arrowHoldRef = useRef<number | null>(null)
  
  const scrollTextBy = (el: HTMLDivElement, dy: number, smooth = true) => {
    if (smooth) {
      el.scrollBy({ top: dy, behavior: "smooth" })
    } else {
      el.scrollTop += dy
    }
  }

  const startArrowHold = (el: HTMLDivElement, dy: number) => {
    if (arrowHoldRef.current) window.clearInterval(arrowHoldRef.current)
    scrollTextBy(el, dy, true)
    arrowHoldRef.current = window.setInterval(() => {
      scrollTextBy(el, dy, false)
    }, 50) as unknown as number
  }

  const stopArrowHold = () => {
    if (!arrowHoldRef.current) return
    window.clearInterval(arrowHoldRef.current)
    arrowHoldRef.current = null
  }

  // 휠 이벤트를 가로 스크롤로 변환하는 핵심 로직
  const handleWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return

    const dx = e.deltaX ?? 0
    const dy = e.deltaY ?? 0
    const raw = Math.abs(dx) > Math.abs(dy) ? dx : dy
    if (raw === 0) return

    const native = e.nativeEvent
    const deltaMode = native?.deltaMode ?? 0
    const normalized =
      deltaMode === 1 ? raw * 16 : deltaMode === 2 ? raw * window.innerHeight : raw

    e.preventDefault()
    el.scrollLeft += normalized * 2
  }

  const handleTextPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    const el = e.currentTarget
    dragStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      startY: e.clientY,
      startScrollTop: el.scrollTop,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  const handleTextPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current
    if (!state.active || state.pointerId !== e.pointerId) return
    const el = e.currentTarget
    const dy = e.clientY - state.startY
    el.scrollTop = state.startScrollTop - dy
    e.preventDefault()
  }

  const endTextDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current
    if (state.pointerId !== e.pointerId) return
    dragStateRef.current = { active: false, pointerId: null, startY: 0, startScrollTop: 0 }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const companyBadge: Record<string, string> = {
    ndb: "N",
    snp: "S",
    metalogic: "M",
  };
  const companyLabel = Array.isArray(project.companies)
    ? project.companies.map((c: string) => companyBadge[c] ?? c).join("")
    : "";

  const title = t(project.titleKo ?? project.title, project.title)

  const hasContent = Array.isArray(project.content) && project.content.length > 0
  const fallbackSlides: any[] = (() => {
    const allImages = project.images && project.images.length > 0
      ? project.images
      : [project.image || "/api/placeholder/1200/800"];

    return [
      { type: "image", src: allImages[0], alt: "main" },
      {
        type: "text",
        body: { ko: project.descriptionKo ?? project.description, en: project.description },
      },
      ...allImages.slice(1).map((src: string) => ({ type: "image" as const, src, alt: "detail" })),
    ]
  })()

  const rawSlides = hasContent ? (project.content as any[]) : fallbackSlides
  const coverSrc = project.image

  const firstTextSlideIdx = rawSlides.findIndex((s: any) => s?.type === "text")
  const firstTextSlide = firstTextSlideIdx >= 0 ? rawSlides[firstTextSlideIdx] : null

  const restSlides = rawSlides.filter((s: any, idx: number) => {
    if (idx === firstTextSlideIdx) return false
    if (s?.type === "image" && s?.src === coverSrc) return false
    return true
  })

  const slides: any[] = []
  if (firstTextSlide) slides.push(firstTextSlide)
  if (coverSrc) slides.push({ type: "image" as const, src: coverSrc, alt: "cover" })
  slides.push(...restSlides)

  const firstTextIndex = slides.findIndex((s: any) => s?.type === "text")

  return (
    <div 
      className={`relative w-full h-full max-h-full min-h-0 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-1000 ease-out 
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`} // 애니메이션 효과 적용
    >
      {/* 1. 언어 변경 버튼 (언어 전환 기능만 수행) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setLanguage(language === "ko" ? "en" : "ko")
        }}
        className="absolute right-16 top-4 z-50 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-foreground/80 backdrop-blur-sm transition-colors hover:bg-background"
      >
        {language === "ko" ? "KOR" : "ENG"}
      </button>

      {/* 2. 전용 닫기(X) 버튼 (handleClose 연결) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleClose();
        }}
        className="absolute right-4 top-4 z-50 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <button 
        onClick={() => scroll('left')} 
        className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden md:block text-white transition-all hover:scale-110 active:scale-95"
        style={{ filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.8))' }}
      >
        <ChevronLeft className="h-10 w-10 stroke-[2.5]" />
      </button>

      <button 
        onClick={() => scroll('right')} 
        className="absolute right-6 top-1/2 -translate-y-1/2 z-40 hidden md:block text-white transition-all hover:scale-110 active:scale-95"
        style={{ filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.8))' }}
      >
        <ChevronRight className="h-10 w-10 stroke-[2.5]" />
      </button>

      {/* Mobile view */}
      <div className="h-full md:hidden overflow-y-auto snap-y snap-mandatory">
        {slides.map((slide: any, index: number) => {
          if (slide.type === "text") {
            const slideTitle = slide.title ? t(slide.title.ko, slide.title.en) : undefined
            const slideBody = t(slide.body.ko, slide.body.en)
            const isFirstText = index === firstTextIndex
            return (
              <section key={`m-text-${index}`} className="snap-start flex h-full w-full flex-col overflow-y-auto bg-white p-8 text-left dark:bg-zinc-950">
                {index === firstTextIndex ? <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{companyLabel}</p> : null}
                {isFirstText ? <h2 className="mt-4 text-3xl font-black tracking-tighter leading-tight text-foreground text-right">{title}</h2> : null}
                {slideTitle ? <h3 className={["font-semibold tracking-tight text-foreground/90", isFirstText ? "mt-4 text-base" : "mt-2 text-lg"].join(" ")}>{slideTitle}</h3> : null}
                <p className="mt-5 whitespace-pre-wrap text-[15px] font-light leading-relaxed text-zinc-600 dark:text-zinc-400">{slideBody}</p>
              </section>
            )
          }
          return (
            <section key={`m-img-${index}`} className="snap-start flex h-full w-full items-center justify-center bg-white dark:bg-black overflow-hidden">
              <img src={slide.src} className="block h-full w-auto max-w-full object-contain select-none" alt={slide.alt ?? "image"} />
            </section>
          )
        })}
      </div>

      {/* Desktop view */}
      <div 
        ref={scrollRef}
        onWheelCapture={handleWheelCapture}
        className="hidden md:flex flex-row flex-nowrap h-full max-h-full min-h-0 overflow-x-auto overflow-y-hidden no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide: any, index: number) => {
          if (slide.type === "text") {
            const slideTitle = slide.title ? t(slide.title.ko, slide.title.en) : undefined
            const slideBody = t(slide.body.ko, slide.body.en)
            const isFirstText = index === firstTextIndex
            return (
              <div key={`text-${index}`} data-slide="text" className="relative flex-none h-full w-[500px] max-h-full min-h-0 overflow-y-auto no-scrollbar bg-white dark:bg-zinc-950 border-x border-zinc-100 dark:border-zinc-800">
                <div className="pointer-events-auto absolute right-4 top-4 bottom-4 z-10 hidden md:flex flex-col justify-between">
                  <button type="button" className="grid h-8 w-8 place-items-center text-zinc-300 hover:text-zinc-400" onClick={(e) => {
                    const scroller = e.currentTarget.closest('[data-slide="text"]')?.querySelector('[data-text-scroller="true"]') as HTMLDivElement | null
                    if (scroller) scrollTextBy(scroller, -180, true)
                  }} onPointerDown={(e) => {
                    const scroller = e.currentTarget.closest('[data-slide="text"]')?.querySelector('[data-text-scroller="true"]') as HTMLDivElement | null
                    if (scroller) startArrowHold(scroller, -22)
                  }} onPointerUp={stopArrowHold} onPointerLeave={stopArrowHold}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <button type="button" className="grid h-8 w-8 place-items-center text-zinc-300 hover:text-zinc-400" onClick={(e) => {
                    const scroller = e.currentTarget.closest('[data-slide="text"]')?.querySelector('[data-text-scroller="true"]') as HTMLDivElement | null
                    if (scroller) scrollTextBy(scroller, 180, true)
                  }} onPointerDown={(e) => {
                    const scroller = e.currentTarget.closest('[data-slide="text"]')?.querySelector('[data-text-scroller="true"]') as HTMLDivElement | null
                    if (scroller) startArrowHold(scroller, 22)
                  }} onPointerUp={stopArrowHold} onPointerLeave={stopArrowHold}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
                <div
                  ref={index === firstTextIndex ? textPanelRef : undefined}
                  data-text-scroller="true"
                  className="h-full min-h-0 overflow-y-hidden p-12 pr-16 md:p-16 md:pr-20"
                  onPointerDown={handleTextPointerDown}
                  onPointerMove={handleTextPointerMove}
                  onPointerUp={endTextDrag}
                  onPointerCancel={endTextDrag}
                  onPointerLeave={endTextDrag}
                  style={{ cursor: "grab", touchAction: "none" }}
                >
                  {index === firstTextIndex ? <p className="text-[10px] font-bold text-blue-600 mb-4">{companyLabel}</p> : null}
                  {isFirstText ? <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight">{title}</h2> : null}
                  {slideTitle ? <h3 className={["font-semibold tracking-tight text-foreground/90", isFirstText ? "mt-4 mb-4 text-base" : "mb-4 text-lg"].join(" ")}>{slideTitle}</h3> : null}
                  <p className="text-base md:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light whitespace-pre-wrap">{slideBody}</p>
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
        <div className="flex-none w-[20vw] h-full bg-zinc-50 dark:bg-zinc-900/10 flex items-center justify-center">
           <span className="text-[10px] uppercase tracking-[2em] text-zinc-300 rotate-90 font-bold opacity-30">END OF PROJECT</span>
        </div>
      </div>
    </div>
  );
}