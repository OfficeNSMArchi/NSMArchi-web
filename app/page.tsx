"use client"

import { NsmSiteHeader } from "@/components/nsm-site-header"
import { NsmCategoryProvider, useNsmCategory } from "@/components/nsm-category-provider"
import { SiteFooter } from "@/components/site-footer"
import { allProjects } from "@/data/projects/index"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"

const homeProjects = allProjects
  .filter((p) => p.showOnHome)
  .sort((a, b) => {
    const aIsResearch = a.category === "research"
    const bIsResearch = b.category === "research"
    if (aIsResearch !== bIsResearch) return aIsResearch ? 1 : -1
    return Number(b.year) - Number(a.year)
  })

function HomeContent() {
  const { selectedCategory } = useNsmCategory()
  const projects = selectedCategory === "all"
    ? homeProjects
    : homeProjects.filter((p) => (p as any).nsmCategory === selectedCategory)

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-h, 64px)' }}>
      <NsmSiteHeader />
      <main>
        <section className="py-8 md:py-12">
          <ProjectZoomGallery storageKey="nsm-home" projects={projects} />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function HomePage() {
  return (
    <NsmCategoryProvider>
      <HomeContent />
    </NsmCategoryProvider>
  )
}
