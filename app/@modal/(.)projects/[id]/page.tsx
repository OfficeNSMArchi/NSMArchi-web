"use client"

import { allProjects } from "@/data/projects/index";
import { ProjectDetailView } from "@/components/project-detail-view";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogPortal } from "@/components/ui/dialog";
import React, { use } from 'react';
import { cn } from "@/lib/utils"

interface ModalProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectModal({ params }: ModalProps) {
  const router = useRouter();
  const { id } = use(params);
  const project = allProjects.find((p) => p.id === id);

  if (!project) return null;

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogPortal>
        <DialogContent 
          showCloseButton={false}
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] !max-w-none w-screen h-[85vh] md:h-[80vh] p-0 bg-transparent",
            "!grid-rows-1 !grid-cols-1",
            "border-none rounded-none outline-none shadow-none",
            // [핵심] overflow-visible로 변경하여 이미지가 모달 밖에서 날아올 때 잘리지 않게 함
            "overflow-visible", 
            // [핵심] zoom 및 fade 애니메이션을 제거하여 사진이 가려지거나 좌표가 꼬이는 것을 방지
            "data-[state=open]:animate-in data-[state=closed]:animate-out"
          )}
        >
          <DialogTitle className="sr-only">{project.titleKo || project.title}</DialogTitle>
          <div className="relative w-full h-full min-h-0">
            <ProjectDetailView project={project} />
            
            <button 
              onClick={() => router.back()}
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