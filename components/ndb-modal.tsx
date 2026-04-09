"use client"

import { useMemo, useState } from "react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Building2, Calendar, MapPin, Ruler, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProjectCard } from "@/components/project-card"
import { ProjectModal } from "@/components/project-modal"
import { cn } from "@/lib/utils"
import { companies, projects, type Project } from "@/lib/projects-data"
import { useLanguage } from "@/lib/language-context"

type NDBModalProps = {
  open: boolean
  onClose: () => void
}

const statusColors = {
  completed: "bg-emerald-500/90 text-white",
  "in-progress": "bg-amber-500/90 text-white",
  planning: "bg-muted text-muted-foreground",
} as const

export function NDBModal({ open, onClose }: NDBModalProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { t } = useLanguage()

  const ndbProjects = useMemo(
    () => projects.filter((p) => p.companies.includes("ndb")),
    [],
  )
  const company = companies.ndb

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto p-0">
          <VisuallyHidden>
            <DialogTitle>{company.name}</DialogTitle>
            <DialogDescription>{company.fullName}</DialogDescription>
          </VisuallyHidden>

          <section className="border-b border-border bg-muted/30 px-6 py-12 md:px-8 md:py-16">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {t("N+S+M 파트너", "N+S+M Partner")}
                </p>
                <h1 className="mt-4 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
                  {company.name}
                </h1>
                <p className="mt-2 text-xl text-muted-foreground">
                  {company.fullName}
                </p>
                <p className="mt-6 text-lg text-muted-foreground">
                  {t(company.description, company.descriptionEn)}
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <p className="text-xs font-medium uppercase tracking-wider">
                      {t("설립", "Founded")}
                    </p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {company.founded}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <p className="text-xs font-medium uppercase tracking-wider">
                      {t("위치", "Location")}
                    </p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {company.location.split(",")[0]}
                  </p>
                </div>
                <div className="col-span-2 rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    <p className="text-xs font-medium uppercase tracking-wider">
                      {t("전문 분야", "Expertise")}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.expertise.map((exp) => (
                      <span
                        key={exp}
                        className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 py-12 md:px-8 md:py-16">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Portfolio
                </p>
                <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                  프로젝트
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "text-xs font-medium",
                    statusColors["completed"],
                  )}
                >
                  {ndbProjects.length} Projects
                </Badge>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  NDB
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {ndbProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          </section>
        </DialogContent>
      </Dialog>

      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  )
}

