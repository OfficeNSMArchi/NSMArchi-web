import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { allProjects } from "@/data/projects/index";
import { ProjectRedirect } from "./redirect";

const SITE_URL = "https://nsmarchi.com";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return allProjects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = allProjects.find((p) => p.id === id);
  if (!project) return {};

  const title = project.titleKo || project.title;
  const description = (project.descriptionKo || project.description || "").slice(0, 160);
  const imageUrl = project.image ? `${SITE_URL}${project.image}` : undefined;
  const pageUrl = `${SITE_URL}/projects/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 900, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
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
