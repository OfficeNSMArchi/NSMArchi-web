"use client"

import { NsmSiteHeader } from "@/components/nsm-site-header"
import { useNsmCategory } from "@/components/nsm-category-provider"
import { SiteFooter } from "@/components/site-footer"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"
import { Project } from "@/types/project"

export function HomeContent({ projects }: { projects: Project[] }) {
  const { selectedCategory } = useNsmCategory()
  const filtered = selectedCategory === "all"
    ? projects
    : projects.filter((p) => (p as any).nsmCategory === selectedCategory)

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-h, 64px)' }}>
      <NsmSiteHeader />
      <main>
        <section className="py-8 md:py-12">
          <ProjectZoomGallery storageKey="nsm-home" projects={filtered} />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
