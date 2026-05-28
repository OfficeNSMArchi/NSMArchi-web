"use client"

import { useMetalogicCategory } from "@/components/metalogic-category-provider"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"
import { Project } from "@/types/project"
import { METALOGIC_CATEGORIES } from "@/lib/metalogicCategorySchema"

function sortByYear(a: Project, b: Project) {
  return (b.year ?? "").localeCompare(a.year ?? "")
}

export function MetalogicContent({ projects }: { projects: Project[] }) {
  const { selectedCategory } = useMetalogicCategory()

  // 카테고리 선택 시
  if (selectedCategory !== "all") {
    const filtered = projects
      .filter((p) => p.metalogicCategory === selectedCategory)
      .sort(sortByYear)

    return filtered.length === 0 ? (
      <p className="mt-8 px-6 text-sm text-muted-foreground">No projects yet in this category.</p>
    ) : (
      <ProjectZoomGallery storageKey={`metalogic-${selectedCategory}`} projects={filtered} />
    )
  }

  // ALL — 카테고리 순서대로 정렬해서 단일 갤러리
  const sorted = METALOGIC_CATEGORIES.flatMap(({ key }) =>
    projects.filter((p) => p.metalogicCategory === key).sort(sortByYear)
  )

  // 그리드 뷰용 섹션 정보 (빈 섹션 제외)
  const gridSections = METALOGIC_CATEGORIES
    .map(({ key, label }) => ({
      label,
      projects: projects.filter((p) => p.metalogicCategory === key).sort(sortByYear),
    }))
    .filter((s) => s.projects.length > 0)

  return sorted.length === 0 ? (
    <p className="mt-8 px-6 text-sm text-muted-foreground">No projects yet.</p>
  ) : (
    <ProjectZoomGallery storageKey="metalogic-all" projects={sorted} gridSections={gridSections} />
  )
}
