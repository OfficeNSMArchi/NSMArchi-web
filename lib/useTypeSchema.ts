export const USE_TYPES = [
  { key: "complex",      ko: "단지계획",  en: "Complex Planning" },
  { key: "residential",  ko: "주거",      en: "Residential" },
  { key: "office",       ko: "업무시설",  en: "Office" },
  { key: "commercial",   ko: "상업",      en: "Commercial" },
  { key: "neighborhood", ko: "근생",      en: "Neighborhood Facility" },
  { key: "mixed-use",             ko: "복합시설",  en: "Mixed-use" },
  { key: "residential-commercial", ko: "주상복합",  en: "Residential-Commercial" },
  { key: "industrial",   ko: "공업",      en: "Industrial" },
  { key: "interior",     ko: "인테리어",  en: "Interior" },
] as const;

export type UseTypeKey = typeof USE_TYPES[number]["key"] | "";

export function getUseTypeLabel(key: UseTypeKey, lang: "ko" | "en"): string {
  const found = USE_TYPES.find((t) => t.key === key);
  return found ? found[lang] : "-";
}
