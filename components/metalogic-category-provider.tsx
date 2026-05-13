"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { UseTypeKey } from "@/lib/useTypeSchema"

export type MetalogicCategoryKey = "all" | "practice" | "research" | "solution" | "essay" | "education" | "roots"

const MetalogicCategoryContext = createContext<{
  selectedCategory: MetalogicCategoryKey
  setSelectedCategory: (key: MetalogicCategoryKey) => void
  selectedUseType: UseTypeKey
  setSelectedUseType: (key: UseTypeKey) => void
} | null>(null)

export function MetalogicCategoryProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<MetalogicCategoryKey>("all")
  const [selectedUseType, setSelectedUseType] = useState<UseTypeKey>("")

  return (
    <MetalogicCategoryContext.Provider
      value={{ selectedCategory, setSelectedCategory, selectedUseType, setSelectedUseType }}
    >
      {children}
    </MetalogicCategoryContext.Provider>
  )
}

export function useMetalogicCategory() {
  const ctx = useContext(MetalogicCategoryContext)
  if (!ctx) throw new Error("useMetalogicCategory must be used within MetalogicCategoryProvider")
  return ctx
}
