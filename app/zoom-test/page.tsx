"use client";

import React from 'react';
import { allProjects } from '@/data/projects';
import { ProjectZoomGallery } from '@/components/project-zoom-gallery';

export default function ZoomTestPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      <div className="min-h-screen p-1 md:p-6 lg:p-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold mt-24 mb-12">Production Refactor Test</h1>
        <ProjectZoomGallery projects={allProjects} />
      </div>
    </div>
  );
}
