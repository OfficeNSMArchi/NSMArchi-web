"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Language = "ko" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (ko: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ko")

  const t = (ko: string, en: string) => (language === "ko" ? ko : en)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// Labels translations
export const labels = {
  status: {
    completed: { ko: "완료", en: "Completed" },
    "in-progress": { ko: "진행중", en: "In Progress" },
    planning: { ko: "계획", en: "Planning" },
  },
  projectInfo: {
    location: { ko: "위치", en: "Location" },
    year: { ko: "연도", en: "Year" },
    client: { ko: "클라이언트", en: "Client" },
    area: { ko: "연면적", en: "Area" },
    use: { ko: "용도", en: "Use" },
    status: { ko: "상태", en: "Status" },
  },
  common: {
    close: { ko: "닫기", en: "Close" },
    viewProjects: { ko: "프로젝트 보기", en: "View Projects" },
  },
}
