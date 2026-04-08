"use client"

import { X, MapPin, Calendar, Building2, Ruler, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/projects-data"
import { labels, useLanguage } from "@/lib/language-context"

interface ProjectModalProps {
  project: Project | null
  open: boolean
  onClose: () => void
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

const companyLabels = {
  ndb: "NDB",
  snp: "SNP",
  metalogic: "META LOGIC",
} as const

export function ProjectModal({ project, open, onClose }: ProjectModalProps) {
  if (!project) return null
  const { language, t } = useLanguage()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[90vh] max-w-4xl overflow-y-auto p-0"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>{t(project.titleKo, project.title)}</DialogTitle>
          <DialogDescription>
            {t(project.descriptionKo, project.description)}
          </DialogDescription>
        </VisuallyHidden>
        {/* Hero Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={project.image}
            alt={t(project.titleKo, project.title)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          {/* Status Badge */}
          <Badge
            className={cn(
              "absolute left-6 top-6 text-sm font-medium",
              statusColors[project.status]
            )}
          >
            {statusLabels[project.status]}
          </Badge>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <p className="text-sm font-medium uppercase tracking-wider text-foreground/70">
              {project.companies.map((c) => companyLabels[c]).join(" / ")}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              {t(project.titleKo, project.title)}
            </h2>
            <p className="mt-1 text-lg text-muted-foreground">
              {language === "ko" ? project.title : project.titleKo}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {t(
                    labels.projectInfo.location.ko,
                    labels.projectInfo.location.en,
                  )}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {t(project.locationKo, project.location)}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {t(labels.projectInfo.year.ko, labels.projectInfo.year.en)}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {project.year}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ruler className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {t(labels.projectInfo.area.ko, labels.projectInfo.area.en)}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {project.area}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {t(labels.projectInfo.use.ko, labels.projectInfo.use.en)}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {language === "ko" ? project.useKo : project.use}
              </p>
            </div>
          </div>

          {/* Client */}
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t(labels.projectInfo.client.ko, labels.projectInfo.client.en)}
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {language === "ko" ? project.clientKo : project.client}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground">
              {t("프로젝트 개요", "Project Overview")}
            </h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t(project.descriptionKo, project.description)}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <Button onClick={onClose}>
              {t(labels.common.close.ko, labels.common.close.en)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
