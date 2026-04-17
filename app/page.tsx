"use client"

import { ProjectCard } from "@/components/project-card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { projects } from "@/lib/projects-data"

// 홈 메인 노출은 데이터에서 직접 지정
const featuredProjects = projects
  .filter((p) => p.showOnHome)
  .sort((a, b) => {
    const aIsResearch = a.category === "research"
    const bIsResearch = b.category === "research"
    if (aIsResearch !== bIsResearch) return aIsResearch ? 1 : -1 // design 먼저
    return Number(b.year) - Number(a.year) // 같은 카테고리면 최신 연도 우선
  })

export default function HomePage() {
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
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
