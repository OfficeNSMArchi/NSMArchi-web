"use client"

import { useMetalogicCategory } from "@/components/metalogic-category-provider"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"
import { Project } from "@/types/project"

export function MetalogicContent({ projects }: { projects: Project[] }) {
  const { selectedCategory } = useMetalogicCategory()
  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter((project) => project.metalogicCategory === selectedCategory)

  return (
    <>
      {filteredProjects.length === 0 ? (
        <p className="mt-8 px-6 text-sm text-muted-foreground">
          No projects yet in this category.
        </p>
      ) : (
        <ProjectZoomGallery storageKey="metalogic" projects={filteredProjects} />
      )}
    </>
  )
}
