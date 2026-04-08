"use client"

import { useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { ProjectModal } from "@/components/project-modal"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { projects, companies, type Project } from "@/lib/projects-data"
import { useLanguage } from "@/lib/language-context"

const metalogicProjects = projects.filter((p) => p.companies.includes("metalogic"))
const company = companies.metalogic

export default function MetaLogicPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="border-b border-border bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  {t("N/S/M 파트너", "N/S/M Partner")}
                </p>
                <h1 className="mt-4 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
                  META LOGIC
                </h1>
                <p className="mt-2 text-xl text-muted-foreground">
                  {company.fullName}
                </p>
                <p className="mt-6 text-lg text-muted-foreground">
                  {t(company.description, company.descriptionEn)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">설립</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{company.founded}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">위치</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{company.location.split(",")[0]}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">
                    {t("전문 분야", "Expertise")}
                  </p>
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
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Portfolio
                </p>
                <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                  프로젝트
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {metalogicProjects.length} Projects
              </p>
            </div>

            <div className="mt-12 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {metalogicProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  )
}
