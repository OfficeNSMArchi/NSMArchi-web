import { notFound } from "next/navigation";
import { allProjects } from "@/data/projects/index";
import { ProjectDetailView } from "@/components/project-detail-view";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import React from "react";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return allProjects.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = allProjects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-grow" style={{ paddingTop: 'var(--header-h, 64px)', height: 'calc(100vh - var(--header-h, 64px))' }}>
        <ProjectDetailView project={project} />
      </main>
      <SiteFooter />
    </div>
  );
}
