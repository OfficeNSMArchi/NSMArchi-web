"use client"

import React, { useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function ProjectSliderModal({ project, open, onClose }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 2;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [open, project]);

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

  const allImages = project.images && project.images.length > 0 
    ? project.images 
    : [project.image || "/api/placeholder/1200/800"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !max-w-none w-[80vw] h-[50vh] p-0 bg-white dark:bg-zinc-950 border-none outline-none shadow-2xl overflow-hidden z-50"
      >
        <DialogTitle className="sr-only">{project.title}</DialogTitle>

        {/* 닫기 버튼은 DialogContent에 내장된 기본 버튼 하나만 뜹니다. */}

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
          className="flex flex-row flex-nowrap h-full overflow-x-auto overflow-y-hidden no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex-none h-full">
            <img src={allImages[0]} className="h-full w-auto object-cover min-w-[30vw] select-none" alt="main" />
          </div>

          <div className="flex-none h-full w-[500px] p-12 md:p-16 flex flex-col justify-center bg-white dark:bg-zinc-950 border-x border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">{project.company}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-8">{project.title}</h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-light whitespace-pre-wrap">{project.description}</p>
          </div>

          {allImages.slice(1).map((src: string, index: number) => (
            <div key={index} className="flex-none h-full border-r border-zinc-100 dark:border-zinc-800">
              <img src={src} className="h-full w-auto object-cover min-w-[50vw]" alt="detail" />
            </div>
          ))}

          <div className="flex-none w-[20vw] h-full bg-zinc-50 dark:bg-zinc-900/10 snap-end flex items-center justify-center">
             <span className="text-[10px] uppercase tracking-[2em] text-zinc-300 rotate-90 font-bold opacity-30">END OF PROJECT</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}