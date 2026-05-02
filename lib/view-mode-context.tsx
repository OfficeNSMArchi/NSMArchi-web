"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type ViewMode = "list" | "grid"
type ScrollMode = "horizontal" | "vertical"

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  scrollMode: ScrollMode
  setScrollMode: (mode: ScrollMode) => void
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [scrollMode, setScrollMode] = useState<ScrollMode>("horizontal")
  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, scrollMode, setScrollMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (!context) throw new Error("useViewMode must be used within a ViewModeProvider")
  return context
}
