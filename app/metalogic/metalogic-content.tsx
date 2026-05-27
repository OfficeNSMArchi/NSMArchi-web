"use client"

import { useMetalogicCategory } from "@/components/metalogic-category-provider"
import { ProjectZoomGallery } from "@/components/project-zoom-gallery"
import { Project } from "@/types/project"

const CATEGORY_ORDER = ["initiative", "contribution", "research", "education", "essay"] as const

const SECTION_LABELS: Record<string, string> = {
  initiative:   "INITIATIVE",
  contribution: "CONTRIBUTION",
  research:     "RESEARCH",
  education:    "EDUCATION",
  essay:        "ESSAY",
}

function sortByYear(a: Project, b: Project) {
  return (b.year ?? "").localeCompare(a.year ?? "")
}

export function MetalogicContent({ projects }: { projects: Project[] }) {
  const { selectedCategory, selectedUseType } = useMetalogicCategory()

  // 카테고리 선택 시
  if (selectedCategory !== "all") {
    const filtered = projects
      .filter((p) => {
        if (p.metalogicCategory !== selectedCategory) return false
        if (selectedCategory === "initiative" && selectedUseType && p.useType !== selectedUseType) return false
        return true
      })
      .sort(sortByYear)

    return filtered.length === 0 ? (
      <p className="mt-8 px-6 text-sm text-muted-foreground">No projects yet in this category.</p>
    ) : (
      <ProjectZoomGallery storageKey={`metalogic-${selectedCategory}`} projects={filtered} />
    )
  }

  // ALL — 카테고리 순서대로 정렬해서 단일 갤러리
  const sorted = CATEGORY_ORDER.flatMap((cat) =>
    projects.filter((p) => p.metalogicCategory === cat).sort(sortByYear)
  )

  // 그리드 뷰용 섹션 정보 (빈 섹션 제외)
  const gridSections = CATEGORY_ORDER
    .map((cat) => ({
      label: SECTION_LABELS[cat],
      projects: projects.filter((p) => p.metalogicCategory === cat).sort(sortByYear),
    }))
    .filter((s) => s.projects.length > 0)

  return sorted.length === 0 ? (
    <p className="mt-8 px-6 text-sm text-muted-foreground">No projects yet.</p>
  ) : (
    <ProjectZoomGallery storageKey="metalogic-all" projects={sorted} gridSections={gridSections} />
  )
}
