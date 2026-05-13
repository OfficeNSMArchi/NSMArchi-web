"use client"

import { NsmSiteHeader } from "@/components/nsm-site-header"
import { useNsmCategory } from "@/components/nsm-category-provider"
import { SiteFooter } from "@/components/site-footer"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"
import { Project } from "@/types/project"

function parseArea(area: string): number {
  const n = parseFloat(area.replace(/[^0-9.]/g, ""))
  return isNaN(n) ? 0 : n
}

export function HomeContent({ projects }: { projects: Project[] }) {
  const { sortKey } = useNsmCategory()

  const sorted = [...projects].sort((a, b) => {
    if (sortKey === "byUse") {
      return (a.useType ?? "").localeCompare(b.useType ?? "")
    }
    if (sortKey === "bySize") {
      return parseArea(b.area) - parseArea(a.area)
    }
    if (sortKey === "byYear") {
      return Number(b.year) - Number(a.year)
    }
    return Number(b.year) - Number(a.year)
  })

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-h, 64px)' }}>
      <NsmSiteHeader />
      <main>
        <section className="py-8 md:py-12">
          <ProjectZoomGallery storageKey="nsm-home" projects={sorted} />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
