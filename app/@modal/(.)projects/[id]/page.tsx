"use client"

import { allProjects } from "@/data/projects/index";
import { ProjectDetailView } from "@/components/project-detail-view";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogPortal } from "@/components/ui/dialog";
import React, { use, useState } from 'react';
import { cn } from "@/lib/utils"

interface ModalProps {
  params: Promise<{
    id: string;
  }>;
}

// 닫는 애니메이션 시간(ms). CSS duration-700과 일치시켜야 끔기지 않음.
const CLOSE_ANIMATION_MS = 700

export default function ProjectModal({ params }: ModalProps) {
  const router = useRouter();
  const { id } = use(params);
  const project = allProjects.find((p) => p.id === id);

  // 닫힘 전환 상태: Dialog open은 false로 두면서 애니메이션 재생 중
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    if (isClosing) return // 중복 실행 방지
    setIsClosing(true)
    // CSS fade-out이 끝난 뒤에만 라우팅
    setTimeout(() => {
      router.back()
    }, CLOSE_ANIMATION_MS)
  }

  if (!project) return null;

  return (
    <Dialog open={!isClosing} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogPortal>
        <DialogContent 
          showCloseButton={false}
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] !max-w-none w-screen h-[85vh] md:h-[80vh] p-0 bg-transparent",
            "!grid-rows-1 !grid-cols-1",
            "border-none rounded-none outline-none shadow-none overflow-hidden",
            // 열/닫기 양방향 페이드 + 줌 애니메이션 (CSS만)
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-75 data-[state=open]:duration-500",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-75 data-[state=closed]:duration-700"
          )}
        >
          <DialogTitle className="sr-only">{project.titleKo || project.title}</DialogTitle>
          <div className="relative w-full h-full min-h-0">
            <ProjectDetailView project={project} />
            
            <button 
              onClick={handleClose}
              className="absolute top-6 left-6 z-[60] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}