"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/projects-data"
import { useLanguage } from "@/lib/language-context"

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

const statusLabels = {
  completed: "완료",
  "in-progress": "진행중",
  planning: "계획",
}

const statusColors = {
  completed: "bg-emerald-500/90 text-white",
  "in-progress": "bg-amber-500/90 text-white",
  planning: "bg-muted text-muted-foreground",
}

const companyBadge: Record<string, string> = {
  ndb: "N",
  snp: "S",
  metalogic: "M",
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  if (!project) return null
  const { language, t } = useLanguage()
  const companyLabel = project.companies
    .map((c) => companyBadge[c])
    .filter(Boolean)
    .join("")

  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden bg-muted text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.image}
          alt={t(project.titleKo, project.title)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/40" />
        
        {/* Status Badge */}
        <Badge
          className={cn(
            "absolute left-4 top-4 text-xs font-medium",
            statusColors[project.status]
          )}
        >
          {statusLabels[project.status]}
        </Badge>

        {/* Company Badge */}
        <span className="absolute right-4 top-4 rounded bg-background/90 px-2 py-1 text-xs font-bold tracking-wider text-foreground backdrop-blur-sm">
          {companyLabel}
        </span>

        {/* Hover Info */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="text-white">
            <p className="text-sm font-medium uppercase tracking-wider opacity-80">
              {t(project.locationKo, project.location)}
            </p>
            <h3 className="mt-1 text-2xl font-bold">
              {t(project.titleKo, project.title)}
            </h3>
            <p className="mt-2 text-sm opacity-80">
              {project.area} · {language === "ko" ? project.useKo : project.use}
            </p>
          </div>
        </div>
      </div>

      {/* Info below image */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground group-hover:underline">
              {t(project.titleKo, project.title)}
            </h3>

          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {project.year}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{project.area}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span>{language === "ko" ? project.useKo : project.use}</span>
        </div>
      </div>
    </button>
  )
}
