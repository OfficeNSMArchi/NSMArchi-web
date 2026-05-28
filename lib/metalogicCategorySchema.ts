/**
 * Metalogic 카테고리 단일 소스 — 여기서만 수정하면 헤더/갤러리/어드민 폼 모두 반영
 */
export const METALOGIC_CATEGORIES = [
  { key: "initiative",   label: "INITIATIVE"   },
  { key: "contribution", label: "CONTRIBUTION" },
  { key: "research",     label: "RESEARCH"     },
  { key: "education",    label: "EDUCATION"    },
  { key: "essay",        label: "ESSAY"        },
] as const

/** MDX에 저장되는 카테고리 키 ("all" 제외) */
export type MetalogicCategorySlug = typeof METALOGIC_CATEGORIES[number]["key"]

/** UI 선택 상태 포함 (all = 전체 보기) */
export type MetalogicCategoryKey = "all" | MetalogicCategorySlug

/** 순서대로 키 배열 */
export const METALOGIC_CATEGORY_ORDER = METALOGIC_CATEGORIES.map((c) => c.key)

/** 키 → 라벨 맵 */
export const METALOGIC_CATEGORY_LABELS: Record<MetalogicCategorySlug, string> = Object.fromEntries(
  METALOGIC_CATEGORIES.map((c) => [c.key, c.label])
) as Record<MetalogicCategorySlug, string>
