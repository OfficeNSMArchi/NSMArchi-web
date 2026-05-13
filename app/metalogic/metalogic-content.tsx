"use client"

import { useMetalogicCategory } from "@/components/metalogic-category-provider"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"
import { Project } from "@/types/project"

export function MetalogicContent({ projects }: { projects: Project[] }) {
  const { selectedCategory, selectedUseType } = useMetalogicCategory()

  const filtered = projects.filter((p) => {
    if (selectedCategory !== "all" && p.metalogicCategory !== selectedCategory) return false
    if (selectedCategory === "practice" && selectedUseType && p.useType !== selectedUseType) return false
    return true
  })

  return (
    <>
      {filtered.length === 0 ? (
        <p className="mt-8 px-6 text-sm text-muted-foreground">
          No projects yet in this category.
        </p>
      ) : (
        <ProjectZoomGallery storageKey="metalogic" projects={filtered} />
      )}
    </>
  )
}
