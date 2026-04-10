"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type MetalogicCategoryKey = "practice" | "concept" | "research" | "academic"

const MetalogicCategoryContext = createContext<{
  selectedCategory: MetalogicCategoryKey
  setSelectedCategory: (key: MetalogicCategoryKey) => void
} | null>(null)

export function MetalogicCategoryProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] =
    useState<MetalogicCategoryKey>("practice")

  return (
    <MetalogicCategoryContext.Provider
      value={{ selectedCategory, setSelectedCategory }}
    >
      {children}
    </MetalogicCategoryContext.Provider>
  )
}

export function useMetalogicCategory() {
  const ctx = useContext(MetalogicCategoryContext)
  if (!ctx) {
    throw new Error(
      "useMetalogicCategory must be used within MetalogicCategoryProvider",
    )
  }
  return ctx
}
