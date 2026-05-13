"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type NsmSortKey = "default" | "byUse" | "bySize" | "byYear"

const NsmSortContext = createContext<{
  sortKey: NsmSortKey
  setSortKey: (key: NsmSortKey) => void
} | null>(null)

export function NsmCategoryProvider({ children }: { children: ReactNode }) {
  const [sortKey, setSortKey] = useState<NsmSortKey>("default")
  return (
    <NsmSortContext.Provider value={{ sortKey, setSortKey }}>
      {children}
    </NsmSortContext.Provider>
  )
}

export function useNsmCategory() {
  const ctx = useContext(NsmSortContext)
  if (!ctx) throw new Error("useNsmCategory must be used within NsmCategoryProvider")
  return ctx
}
