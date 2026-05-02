"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { useMetalogicCategory, type MetalogicCategoryKey } from "@/components/metalogic-category-provider"

const categories: { key: MetalogicCategoryKey; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "practice", label: "PRACTICE" },
  { key: "concept", label: "CONCEPT" },
  { key: "research", label: "RESEARCH" },
  { key: "academic", label: "ACADEMIC" },
]

export function MetalogicSiteHeader() {
  const { selectedCategory, setSelectedCategory } = useMetalogicCategory()

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
          {categories.map((cat) => (
            <div key={cat.key} className="flex items-center gap-1">
              <button
                onClick={() => { setSelectedCategory(cat.key); onClose() }}
                className={cn(
                  "text-[10px] font-medium text-foreground transition-opacity",
                  selectedCategory === cat.key ? "opacity-100" : "opacity-40 hover:opacity-70"
                )}
              >
                {cat.label}
              </button>
              {cat.key === "all" && (
                <>
                  <span className="text-[10px] text-foreground opacity-20">/</span>
                  <button
                    onClick={() => { window.dispatchEvent(new CustomEvent('nsm-reset')); onClose() }}
                    className="text-[10px] font-medium text-foreground opacity-40 hover:opacity-70 transition-opacity"
                  >
                    RESET
                  </button>
                </>
              )}
            </div>
          ))}
          <Link
            href="/metalogic/about"
            onClick={onClose}
            className="text-[10px] font-medium text-foreground hover:opacity-60 transition-opacity"
          >
            ABOUT US
          </Link>
        </>
      )}
    />
  )
}
