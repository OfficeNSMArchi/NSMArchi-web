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

// 1. 닫는 애니메이션 시간을 ProjectDetailView와 동일하게 1000ms(1초)로 수정합니다.
const CLOSE_ANIMATION_MS = 1000

export default function ProjectModal({ params }: ModalProps) {
  const router = useRouter();
  const { id } = use(params);
  const project = allProjects.find((p) => p.id === id);

  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    if (isClosing) return 
    setIsClosing(true)
    // 1초 뒤에 뒤로가기 실행
    setTimeout(() => {
      router.back()
    }, CLOSE_ANIMATION_MS)
  }

  if (!project) return null;

  return (
    // 바깥 영역을 누르면 자동으로 handleClose가 실행됩니다.
    <Dialog open={!isClosing} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogPortal>
        <DialogContent 
          showCloseButton={false}
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] !max-w-none w-screen h-[85vh] md:h-[80vh] p-0 bg-transparent",
            "!grid-rows-1 !grid-cols-1",
            "border-none rounded-none outline-none shadow-none overflow-hidden",
            // 2. 닫힐 때 시간을 duration-1000으로 수정합니다.
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-75 data-[state=open]:duration-500",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-75 data-[state=closed]:duration-1000"
          )}
        >
          <DialogTitle className="sr-only">{project.titleKo || project.title}</DialogTitle>
          <div className="relative w-full h-full min-h-0">
            {/* 3. 핵심: 자식 컴포넌트에게 현재 부모가 닫히는 중이라는 신호(isExternalClosing)를 보냅니다. */}
            <ProjectDetailView project={project} isExternalClosing={isClosing} />
            
            {/* 4. [삭제] 왼쪽 상단에 중복으로 있던 X 버튼을 제거했습니다. */}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}