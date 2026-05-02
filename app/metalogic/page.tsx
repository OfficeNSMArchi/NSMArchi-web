"use client"

import { MetalogicSiteHeader } from "@/components/metalogic-site-header"
import { useMetalogicCategory } from "@/components/metalogic-category-provider"
import { SiteFooter } from "@/components/site-footer"
import { allProjects } from "@/data/projects/index"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"

const hiddenOnMetaLogicPage = new Set<string>(["ml-factory", "nsm-resort"])
const metalogicProjects = allProjects.filter(
  (p) => p.companies.includes("metalogic") && !hiddenOnMetaLogicPage.has(p.id),
)

export default function MetaLogicPage() {
  const { selectedCategory } = useMetalogicCategory()
  const filteredProjects = selectedCategory === "all"
    ? metalogicProjects
    : metalogicProjects.filter((project) => project.metalogicCategory === selectedCategory)

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-h, 48px)' }}>
      <MetalogicSiteHeader />

      <main>
        <section className="py-8 md:py-12">
          {filteredProjects.length === 0 ? (
            <p className="mt-8 px-6 text-sm text-muted-foreground">
              No projects yet in this category.
            </p>
          ) : (
            <ProjectZoomGallery storageKey="metalogic" projects={filteredProjects} />
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
