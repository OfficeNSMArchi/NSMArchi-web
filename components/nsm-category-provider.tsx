"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type NsmCategoryKey = "all" | "residential" | "commercial" | "public"

const NsmCategoryContext = createContext<{
  selectedCategory: NsmCategoryKey
  setSelectedCategory: (key: NsmCategoryKey) => void
} | null>(null)

export function NsmCategoryProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<NsmCategoryKey>("all")
  return (
    <NsmCategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </NsmCategoryContext.Provider>
  )
}

export function useNsmCategory() {
  const ctx = useContext(NsmCategoryContext)
  if (!ctx) throw new Error("useNsmCategory must be used within NsmCategoryProvider")
  return ctx
}
