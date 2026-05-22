import { Project } from "@/types/project"

export function isVisibleOn(p: Project, brand: "ndb" | "snp" | "metalogic"): boolean {
  if (!p.visibleOn) return p.companies?.includes(brand) ?? false
  return p.visibleOn.includes(brand)
}

export function parseAreaNumber(area: string | number | null | undefined): number {
  if (area == null) return 0
  const n = parseFloat(String(area).replace(/[^0-9.]/g, ""))
  return isNaN(n) ? 0 : n
}

export function formatArea(area: string | number | null | undefined): string {
  const n = parseAreaNumber(area)
  if (!n) return "-"
  return n.toLocaleString("ko-KR") + " m²"
}

export function getSizeLabel(area: string | number | null | undefined): "S" | "M" | "L" | "XL" | null {
  const n = parseAreaNumber(area)
  if (!n) return null
  if (n < 1000)  return "S"
  if (n < 3000)  return "M"
  if (n < 10000) return "L"
  return "XL"
}
