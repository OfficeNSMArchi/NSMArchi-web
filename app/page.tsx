"use client"

import { useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { ProjectSliderModal } from "@/components/ProjectSliderModal"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { projects, type Project } from "@/lib/projects-data"



// 홈 메인 노출은 데이터에서 직접 지정
const featuredProjects = projects.filter((p) => p.showOnHome)

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

      {/* Project Modal
      <ProjectModal
        project={selectedProject}
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      
      */}
      
 
      {/* 기존 ProjectModal을 주석 처리하거나 지우고 아래 내용 삽입 */}
 
      <ProjectSliderModal 
      project={selectedProject} // 이제 'projects'가 아니라 'project' 하나만 보냅니다.
      open={!!selectedProject} 
      onClose={() => setSelectedProject(null)} 
      />
      
    </div>
  )
}
