"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { allProjects } from "@/data/projects/index"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"

// 홈 메인 노출은 데이터에서 직접 지정
const featuredProjects = allProjects
  .filter((p) => p.showOnHome)
  .sort((a, b) => {
    const aIsResearch = a.category === "research"
    const bIsResearch = b.category === "research"
    if (aIsResearch !== bIsResearch) return aIsResearch ? 1 : -1 // design 먼저
    return Number(b.year) - Number(a.year) // 같은 카테고리면 최신 연도 우선
  })

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-h, 64px)' }}>
      <SiteHeader />

      <main>
        {/* Projects Zoom Gallery */}
        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-6">
            <ProjectZoomGallery projects={featuredProjects} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
