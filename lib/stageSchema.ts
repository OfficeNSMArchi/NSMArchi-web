export const STAGE_TYPES = ["design", "research", "software"] as const
export type StageType = typeof STAGE_TYPES[number]

export const STAGES: Record<StageType, { key: number; ko: string; en: string; hint?: string }[]> = {
  design: [
    { key: 0, ko: "전략기획",  en: "Strategic",     hint: "사업 계획, 예산 및 타당성 검토, 발주 방식 결정 및 계약" },
    { key: 1, ko: "기획",      en: "Preparation",   hint: "프로젝트 목표/요구사항 정의, 현황 측량, 조사" },
    { key: 2, ko: "계획설계",  en: "Concept",       hint: "건축 개념, 구조/MEP 개략, 계획안" },
    { key: 3, ko: "기본설계",  en: "Design",        hint: "각 분야 조율, 기본설계 완성, 기본 심의" },
    { key: 4, ko: "실시설계",  en: "Technical",     hint: "실시설계, 시방서, 물량산출, 세부심의 및 허가" },
    { key: 5, ko: "시공중",    en: "Construction",  hint: "시공, 현장 감리" },
    { key: 6, ko: "준공",      en: "Handover",      hint: "준공, 사용승인, 인계" },
    { key: 7, ko: "유지관리",  en: "Use",           hint: "사용후평가, 유지관리" },
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
  if (status === "completed") return { stageType: "design", stage: 6 }
  if (status === "in-progress") return { stageType: "design", stage: 3 }
  return { stageType: "design", stage: 1 }
}
