"use client"

import React, { useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function ProjectSliderModal({ project, open, onClose }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage()
  const dragStateRef = useRef<{
    active: boolean
    pointerId: number | null
    startY: number
    startScrollTop: number
  }>({ active: false, pointerId: null, startY: 0, startScrollTop: 0 })

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;

    // Optional: when opened, ensure we start at the beginning.
    // (Keeps behavior deterministic when reopening.)
    el.scrollLeft = 0;

    const textEl = textPanelRef.current
    if (!textEl) return

    // Disable vertical wheel scrolling inside the text panel.
    // Keep the event bubbling so the outer container can still convert it to horizontal scrolling.
    const preventTextWheel = (e: WheelEvent) => {
      e.preventDefault()
    }

    textEl.addEventListener("wheel", preventTextWheel, { passive: false })
    return () => textEl.removeEventListener("wheel", preventTextWheel as any)
  }, [open, project]);

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
    // immediate nudge
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
    // Enable drag-to-scroll for mouse left button.
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

  if (!project) return null;
  const companyBadge: Record<string, string> = {
    ndb: "N",
    snp: "S",
    metalogic: "M",
  };
  const companyLabel = Array.isArray(project.companies)
    ? project.companies.map((c: string) => companyBadge[c] ?? c).join("")
    : "";

  const title = t(project.titleKo ?? project.title, project.title)
  const description = t(project.descriptionKo ?? project.description, project.description)

  const hasContent = Array.isArray(project.content) && project.content.length > 0
  const fallbackSlides: Array<
    | { type: "image"; src: string; alt?: string }
    | { type: "text"; title?: { ko: string; en: string }; body: { ko: string; en: string } }
  > = (() => {
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

  const slides = hasContent ? project.content : fallbackSlides
  const firstTextIndex = slides.findIndex((s: any) => s?.type === "text")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !max-w-none w-[80vw] h-[50vh] p-0 bg-white dark:bg-zinc-950 border-none outline-none shadow-2xl overflow-hidden z-50"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* 닫기 버튼은 DialogContent에 내장된 기본 버튼 하나만 뜹니다. */}
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

        {/* ★ [중요] 화살표 스타일 수정 
            - 배경, 그림자, 테두리 삭제 
            - 대신 아이콘에 흰색 색상과 Drop Shadow(네온 효과)를 주어 가시성을 확보했습니다.
        */}
        
        {/* 좌측 화살표 (아이콘만 남김) */}
        <button 
          onClick={() => scroll('left')} 
          className="absolute left-6 top-1/2 -translate-y-1/2 z-40 text-white transition-all hover:scale-110 active:scale-95"
          style={{ filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.8))' }} // 검은 사진 위에서도 보이게 은은한 그림자
        >
          <ChevronLeft className="h-10 w-10 stroke-[2.5]" /> {/* 크기와 두께를 약간 키움 */}
        </button>

        {/* 우측 화살표 (아이콘만 남김) */}
        <button 
          onClick={() => scroll('right')} 
          className="absolute right-6 top-1/2 -translate-y-1/2 z-40 text-white transition-all hover:scale-110 active:scale-95"
          style={{ filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.8))' }} // 은은한 그림자
        >
          <ChevronRight className="h-10 w-10 stroke-[2.5]" /> {/* 크기와 두께를 약간 키움 */}
        </button>

        <div 
          ref={scrollRef}
          onWheelCapture={handleWheelCapture}
          className="flex flex-row flex-nowrap h-full overflow-x-auto overflow-y-hidden no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {slides.map((slide: any, index: number) => {
            if (slide.type === "text") {
              const slideTitle = slide.title ? t(slide.title.ko, slide.title.en) : undefined
              const slideBody = t(slide.body.ko, slide.body.en)
              const isFirstText = index === firstTextIndex
              return (
                <div
                  key={`text-${index}`}
                  data-slide="text"
                  className="relative flex-none h-full w-[500px] min-h-0 overflow-hidden bg-white dark:bg-zinc-950 border-x border-zinc-100 dark:border-zinc-800"
                >
                  <div className="pointer-events-auto absolute right-4 top-4 bottom-4 z-10 flex flex-col justify-between">
                    <button
                      type="button"
                      aria-label="Scroll text up"
                      className="grid h-8 w-8 place-items-center text-zinc-300 transition-colors hover:text-zinc-400"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const scroller = e.currentTarget
                          .closest('[data-slide=\"text\"]')
                          ?.querySelector('[data-text-scroller=\"true\"]') as HTMLDivElement | null
                        if (!scroller) return
                        scrollTextBy(scroller, -180, true)
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const scroller = e.currentTarget
                          .closest('[data-slide=\"text\"]')
                          ?.querySelector('[data-text-scroller=\"true\"]') as HTMLDivElement | null
                        if (!scroller) return
                        startArrowHold(scroller, -22)
                      }}
                      onPointerUp={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        stopArrowHold()
                      }}
                      onPointerCancel={stopArrowHold}
                      onPointerLeave={stopArrowHold}
                    >
                      <ChevronUp className="h-5 w-5 drop-shadow-[0_0_10px_rgba(0,0,0,0.18)]" />
                    </button>
                    <button
                      type="button"
                      aria-label="Scroll text down"
                      className="grid h-8 w-8 place-items-center text-zinc-300 transition-colors hover:text-zinc-400"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const scroller = e.currentTarget
                          .closest('[data-slide=\"text\"]')
                          ?.querySelector('[data-text-scroller=\"true\"]') as HTMLDivElement | null
                        if (!scroller) return
                        scrollTextBy(scroller, 180, true)
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const scroller = e.currentTarget
                          .closest('[data-slide=\"text\"]')
                          ?.querySelector('[data-text-scroller=\"true\"]') as HTMLDivElement | null
                        if (!scroller) return
                        startArrowHold(scroller, 22)
                      }}
                      onPointerUp={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        stopArrowHold()
                      }}
                      onPointerCancel={stopArrowHold}
                      onPointerLeave={stopArrowHold}
                    >
                      <ChevronDown className="h-5 w-5 drop-shadow-[0_0_10px_rgba(0,0,0,0.18)]" />
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
                    {index === firstTextIndex ? (
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
                        {companyLabel}
                      </p>
                    ) : null}
                    {isFirstText ? (
                      <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight">
                        {title}
                      </h2>
                    ) : null}
                    {slideTitle ? (
                      <h3
                        className={[
                          "font-semibold tracking-tight text-foreground/90",
                          isFirstText ? "mt-4 mb-4 text-base" : "mb-4 text-lg",
                        ].join(" ")}
                      >
                        {slideTitle}
                      </h3>
                    ) : isFirstText ? (
                      <div className="mb-6" />
                    ) : null}
                    <p className="text-base md:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-light whitespace-pre-wrap">
                      {slideBody}
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div key={`img-${index}`} className="flex-none h-full border-r border-zinc-100 dark:border-zinc-800">
                <img
                  src={slide.src}
                  className="h-full w-auto object-cover min-w-[30vw] select-none"
                  alt={slide.alt ?? "image"}
                />
              </div>
            )
          })}

          <div className="flex-none w-[20vw] h-full bg-zinc-50 dark:bg-zinc-900/10 snap-end flex items-center justify-center">
             <span className="text-[10px] uppercase tracking-[2em] text-zinc-300 rotate-90 font-bold opacity-30">END OF PROJECT</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}