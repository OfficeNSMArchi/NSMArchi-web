"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type NdbCategoryKey = "all"

const NdbCategoryContext = createContext<{
  selectedCategory: NdbCategoryKey
  setSelectedCategory: (key: NdbCategoryKey) => void
} | null>(null)

export function NdbCategoryProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<NdbCategoryKey>("all")
  return (
    <NdbCategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </NdbCategoryContext.Provider>
  )
}

export function useNdbCategory() {
  const ctx = useContext(NdbCategoryContext)
  if (!ctx) throw new Error("useNdbCategory must be used within NdbCategoryProvider")
  return ctx
}
