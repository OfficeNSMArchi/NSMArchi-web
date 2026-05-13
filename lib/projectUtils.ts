import { Project } from "@/types/project"

export function isVisibleOn(p: Project, brand: "ndb" | "snp" | "metalogic"): boolean {
  if (!p.visibleOn) return p.companies?.includes(brand) ?? false
  return p.visibleOn.includes(brand)
}
