"use client"

import Link from "next/link"
import { Project } from "@/types/project"
import { useLanguage } from "@/lib/language-context"

const companyBadge: Record<string, string> = {
  ndb: "N",
  snp: "S",
  metalogic: "M",
}

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useLanguage()

  const companyLabel = project.companies
    .map((c) => companyBadge[c])
    .filter(Boolean)
    .join("")

  return (
    <Link
      href={`/projects/${project.id}`}
      scroll={false}
      className="group relative flex h-full w-full flex-col overflow-hidden bg-muted"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.image}
          alt={t(project.titleKo, project.title)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/40" />

        {/* Company Badge (hover 시에만 노출) */}
        <span className="absolute right-4 top-4 text-xs font-bold tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {companyLabel}
        </span>

        {/* Hover Title (좌상단) */}
        <h3 className="absolute left-4 top-4 text-sm font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {t(project.titleKo, project.title)}
        </h3>
      </div>
    </Link>
  )
}