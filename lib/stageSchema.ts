export const STAGE_TYPES = ["project", "research", "software"] as const
export type StageType = typeof STAGE_TYPES[number]

export const STAGES: Record<StageType, { key: number; ko: string; en: string }[]> = {
  project: [
    { key: 0, ko: "전략기획",  en: "Strategic" },
    { key: 1, ko: "기획",      en: "Preparation" },
    { key: 2, ko: "계획설계",  en: "Concept" },
    { key: 3, ko: "기본설계",  en: "Design" },
    { key: 4, ko: "실시설계",  en: "Technical" },
    { key: 5, ko: "시공중",    en: "Construction" },
    { key: 6, ko: "준공",      en: "Handover" },
  ],
  research: [
    { key: 0, ko: "기획",    en: "Planning" },
    { key: 1, ko: "진행중",  en: "Ongoing" },
    { key: 2, ko: "완료",    en: "Completed" },
  ],
  software: [
    { key: 0, ko: "요구사항 분석",  en: "Discovery" },
    { key: 1, ko: "스펙 정의",      en: "Definition" },
    { key: 2, ko: "프로토타입",     en: "Prototype" },
    { key: 3, ko: "개발",           en: "Development" },
    { key: 4, ko: "테스트/검증",    en: "Testing" },
    { key: 5, ko: "배포",           en: "Deployment" },
    { key: 6, ko: "운영",           en: "Operation" },
  ],
}

export function getStageLabel(stageType: StageType, stage: number, lang: "ko" | "en"): string {
  const found = STAGES[stageType]?.find(s => s.key === stage)
  return found ? found[lang] : "-"
}

export function deriveStatus(stageType: StageType, stage: number): "planning" | "in-progress" | "completed" {
  if (stageType === "research") {
    if (stage === 0) return "planning"
    if (stage === 1) return "in-progress"
    return "completed"
  }
  // project & software
  if (stage <= 1) return "planning"
  if (stage <= 4) return "in-progress"
  return "completed"
}

export function migrateStatusToStage(status: string): { stageType: StageType; stage: number } {
  if (status === "completed") return { stageType: "project", stage: 6 }
  if (status === "in-progress") return { stageType: "project", stage: 3 }
  return { stageType: "project", stage: 1 }
}
