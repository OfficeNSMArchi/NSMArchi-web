import { notFound } from "next/navigation";
import { allProjects } from "@/data/projects/index";
import { ProjectRedirect } from "./redirect";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return allProjects.map((project) => ({ id: project.id }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = allProjects.find((p) => p.id === id);

  if (!project) notFound();

  const visibleOn = project.visibleOn ?? project.companies ?? [];
  let targetUrl = '/';
  let storageKey = 'nsm-home';

  if (!visibleOn.includes('nsm')) {
    if (project.companies?.includes('metalogic')) {
      targetUrl = '/metalogic';
      storageKey = 'metalogic';
    } else if (project.companies?.includes('ndb')) {
      targetUrl = '/ndb';
      storageKey = 'ndb';
    } else if (project.companies?.includes('snp')) {
      targetUrl = '/';
      storageKey = 'nsm-home';
    }
  }

  return <ProjectRedirect id={id} targetUrl={targetUrl} storageKey={storageKey} />;
}
