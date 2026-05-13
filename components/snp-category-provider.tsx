"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type SnpCategoryKey = "all" | "project" | "research"

const SnpCategoryContext = createContext<{
  selectedCategory: SnpCategoryKey
  setSelectedCategory: (key: SnpCategoryKey) => void
} | null>(null)

export function SnpCategoryProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<SnpCategoryKey>("all")
  return (
    <SnpCategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </SnpCategoryContext.Provider>
  )
}

export function useSnpCategory() {
  const ctx = useContext(SnpCategoryContext)
  if (!ctx) throw new Error("useSnpCategory must be used within SnpCategoryProvider")
  return ctx
}
