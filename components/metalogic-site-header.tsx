"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { useMetalogicCategory, type MetalogicCategoryKey } from "@/components/metalogic-category-provider"
import { USE_TYPES, type UseTypeKey } from "@/lib/useTypeSchema"

const LOGIC_ITEMS: { key: MetalogicCategoryKey; label: string }[] = [
  { key: "research", label: "RESEARCH" },
  { key: "solution", label: "SOLUTIONS" },
]

const INSIGHT_ITEMS: { key: MetalogicCategoryKey; label: string }[] = [
  { key: "essay",     label: "ESSAY" },
  { key: "education", label: "EDUCATION" },
  { key: "roots",     label: "ROOTS" },
]

export function MetalogicSiteHeader() {
  const { selectedCategory, setSelectedCategory, selectedUseType, setSelectedUseType } = useMetalogicCategory()
  const [practiceOpen, setPracticeOpen] = useState(false)

  function selectCategory(key: MetalogicCategoryKey) {
    setSelectedCategory(key)
    setSelectedUseType("")
  }

  function selectUseType(useType: UseTypeKey) {
    setSelectedCategory("practice")
    setSelectedUseType(useType)
  }

  const isPracticeActive = selectedCategory === "practice"
  const isLogicActive = LOGIC_ITEMS.some((i) => i.key === selectedCategory)
  const isInsightActive = INSIGHT_ITEMS.some((i) => i.key === selectedCategory)

  return (
    <SiteHeader
      brandButton={
        <img src="/branding/metalogic-title.svg" alt="META LOGIC" className="h-6 w-auto" />
      }
      onBackClick={() => window.dispatchEvent(new CustomEvent('nsm-reset'))}
      slideContent={(onClose) => (
        <Link
          href="/"
          onClick={onClose}
          className="shrink-0 flex items-center font-bold tracking-tight opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--foreground)', fontSize: '0.625rem' }}
        >
          <span>N</span><span>+</span><span>S</span><span className="text-muted-foreground">+</span><span>M</span>
        </Link>
      )}
      dropdownItems={(onClose) => (
        <>
          {/* ALL */}
          <button
            onClick={() => { selectCategory("all"); onClose() }}
            className={cn("text-[10px] font-medium text-foreground transition-opacity",
              selectedCategory === "all" ? "opacity-100" : "opacity-40 hover:opacity-70"
            )}
          >
            ALL
          </button>

          {/* PRACTICE + fly-out */}
          <div
            className="relative"
            onMouseEnter={() => setPracticeOpen(true)}
            onMouseLeave={() => setPracticeOpen(false)}
          >
            <button
              onClick={() => { selectCategory("practice"); onClose() }}
              className={cn("text-[10px] font-medium text-foreground transition-opacity",
                isPracticeActive ? "opacity-100" : "opacity-40 hover:opacity-70"
              )}
            >
              PRACTICE {isPracticeActive && selectedUseType ? `/ ${selectedUseType.toUpperCase()}` : ""}
            </button>
            {practiceOpen && (
              <div className="absolute left-full top-0 ml-3 flex flex-col gap-1 bg-background/20 backdrop-blur-md pl-2 pr-3 py-1 border-l border-border">
                {USE_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { selectUseType(t.key); onClose() }}
                    className={cn("text-[10px] font-medium text-foreground whitespace-nowrap transition-opacity",
                      isPracticeActive && selectedUseType === t.key ? "opacity-100" : "opacity-40 hover:opacity-70"
                    )}
                  >
                    {t.en.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LOGIC */}
          <div className="flex flex-col gap-1">
            <span className={cn("text-[10px] font-medium text-foreground transition-opacity",
              isLogicActive ? "opacity-100" : "opacity-40"
            )}>
              LOGIC
            </span>
            {LOGIC_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => { selectCategory(item.key); onClose() }}
                className={cn("text-[10px] font-medium text-foreground pl-2 transition-opacity",
                  selectedCategory === item.key ? "opacity-100" : "opacity-40 hover:opacity-70"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* INSIGHT */}
          <div className="flex flex-col gap-1">
            <span className={cn("text-[10px] font-medium text-foreground transition-opacity",
              isInsightActive ? "opacity-100" : "opacity-40"
            )}>
              INSIGHT
            </span>
            {INSIGHT_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => { selectCategory(item.key); onClose() }}
                className={cn("text-[10px] font-medium text-foreground pl-2 transition-opacity",
                  selectedCategory === item.key ? "opacity-100" : "opacity-40 hover:opacity-70"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* PROFILE */}
          <Link
            href="/metalogic/about"
            onClick={onClose}
            className="text-[10px] font-medium text-foreground opacity-40 hover:opacity-100 transition-opacity"
          >
            PROFILE
          </Link>
        </>
      )}
    />
  )
}
