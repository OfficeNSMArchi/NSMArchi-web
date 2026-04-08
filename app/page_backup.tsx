"use client"

import { useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { ProjectModal } from "@/components/project-modal"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { projects, type Project } from "@/lib/projects-data"

// NSM 메인에는 대표 프로젝트 (featured) 와 공동 프로젝트 (joint) 표시
const featuredProjects = projects.filter(
  (p) => p.featured || p.companies.length > 1
)

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Projects Grid */}
        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
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

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  )
}
