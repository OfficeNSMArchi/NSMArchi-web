"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { useMetalogicCategory, type MetalogicCategoryKey } from "@/components/metalogic-category-provider"
import { METALOGIC_CATEGORIES } from "@/lib/metalogicCategorySchema"

export function MetalogicSiteHeader() {
  const { selectedCategory, setSelectedCategory } = useMetalogicCategory()
  const router = useRouter()
  const pathname = usePathname()

  function selectCategory(key: MetalogicCategoryKey) {
    setSelectedCategory(key)
    if (pathname !== "/metalogic") router.push("/metalogic")
  }

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

          {/* CONTRIBUTION / RESEARCH / EDUCATION (initiative 포함 전체) */}
          {METALOGIC_CATEGORIES.map((item) => (
            <button
              key={item.key}
              onClick={() => { selectCategory(item.key); onClose() }}
              className={cn("text-[10px] font-medium text-foreground transition-opacity",
                selectedCategory === item.key ? "opacity-100" : "opacity-40 hover:opacity-70"
              )}
            >
              {item.label}
            </button>
          ))}

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
