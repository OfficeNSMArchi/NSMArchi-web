"use client"

import { ProjectCard } from "@/components/project-card"
import { MetalogicHeader } from "@/components/metalogic-header"
import { useMetalogicCategory } from "@/components/metalogic-category-provider"
import { SiteFooter } from "@/components/site-footer"
import { projects } from "@/lib/projects-data"

const hiddenOnMetaLogicPage = new Set<string>(["ml-factory", "nsm-resort"])
const metalogicProjects = projects.filter(
  (p) => p.companies.includes("metalogic") && !hiddenOnMetaLogicPage.has(p.id),
)

export default function MetaLogicPage() {
  const { selectedCategory } = useMetalogicCategory()
  const filteredProjects = metalogicProjects.filter(
    (project) => project.metalogicCategory === selectedCategory,
  )

  return (
    <div className="min-h-screen bg-background">
      <MetalogicHeader />

      <main>
        {/* Projects Grid */}
        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
            {filteredProjects.length === 0 && (
              <p className="mt-8 text-sm text-muted-foreground">
                No projects yet in this category.
              </p>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
