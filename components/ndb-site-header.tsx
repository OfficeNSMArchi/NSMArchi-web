"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { useNdbCategory, type NdbCategoryKey } from "@/components/ndb-category-provider"

const categories: { key: NdbCategoryKey; label: string }[] = [
  { key: "all", label: "ALL" },
]

export function NdbSiteHeader() {
  const { selectedCategory, setSelectedCategory } = useNdbCategory()

  return (
    <SiteHeader
      brandButton={
        <img src="/branding/ndb-v.svg" alt="NDB" className="h-[3.75rem] w-auto" />
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
            href="/about"
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
