"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import {
  useMetalogicCategory,
  type MetalogicCategoryKey,
} from "@/components/metalogic-category-provider"
import { MobileNav } from "@/components/mobile-nav"
import { NsmHomeCorner } from "@/components/nsm-home-corner"

const metalogicCategories: { key: MetalogicCategoryKey; label: string }[] = [
  { key: "practice", label: "PRACTICE" },
  { key: "concept", label: "CONCEPT" },
  { key: "research", label: "RESEARCH" },
  { key: "academic", label: "ACADEMIC" },
]

export function MetalogicHeader() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const { selectedCategory, setSelectedCategory } = useMetalogicCategory()
  const mountedPathname = useRef(pathname)
  const showCategoryNav = mountedPathname.current === "/metalogic"
  const headerRef = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 w-full z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <NsmHomeCorner />
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/metalogic" className="inline-flex items-center">
              <img
                src="/branding/metalogic-title.svg"
                alt="META LOGIC"
                className="h-6 w-auto md:h-7"
              />
            </Link>

            <div className="flex items-center gap-1">
              {/* Language Toggle — always visible */}
              <div className="flex items-center gap-1 border-l border-border pl-4 md:pl-6">
                <button
                  onClick={() => setLanguage("ko")}
                  className={cn(
                    "px-2 py-1 text-xs font-medium transition-colors",
                    language === "ko" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  KOR
                </button>
                <span className="text-muted-foreground">/</span>
                <button
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "px-2 py-1 text-xs font-medium transition-colors",
                    language === "en" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  ENG
                </button>
              </div>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden ml-3 flex flex-col justify-center items-center gap-1.5 w-8 h-8"
                aria-label="메뉴"
              >
                <span className={cn("block w-5 h-px bg-foreground transition-all duration-300", menuOpen && "rotate-45 translate-y-[5px]")} />
                <span className={cn("block w-5 h-px bg-foreground transition-all duration-300", menuOpen && "opacity-0")} />
                <span className={cn("block w-5 h-px bg-foreground transition-all duration-300", menuOpen && "-rotate-45 -translate-y-[5px]")} />
              </button>
            </div>
          </div>

          {/* Desktop second row */}
          <div className="hidden md:flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pb-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {showCategoryNav &&
                metalogicCategories.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setSelectedCategory(category.key)}
                    className={cn(
                      "px-1 py-1 text-[11px] font-semibold tracking-wide transition-colors md:text-xs",
                      selectedCategory === category.key
                        ? "text-foreground underline underline-offset-4"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {category.label}
                  </button>
                ))}
            </div>

            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-8">
                <Link
                  href="/metalogic/about"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    pathname === "/metalogic/about" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  ABOUT US
                </Link>
              </nav>

              <div className="flex items-center gap-1 border-l border-border pl-6">
                <Link href="/" className="pr-3 text-sm font-semibold tracking-tight text-foreground hover:opacity-60 transition-opacity">
                  N+S+M
                </Link>
                <button
                  onClick={() => setLanguage("ko")}
                  className={cn(
                    "px-2 py-1 text-xs font-medium transition-colors",
                    language === "ko" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  KOR
                </button>
                <span className="text-muted-foreground">/</span>
                <button
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "px-2 py-1 text-xs font-medium transition-colors",
                    language === "en" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  ENG
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentBrand="M"
        subMenu={
          <>
            {showCategoryNav && metalogicCategories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(category.key)
                  setMenuOpen(false)
                }}
                className={cn(
                  "text-sm font-medium text-left transition-colors",
                  selectedCategory === category.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {category.label}
              </button>
            ))}
            <Link href="/metalogic/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              ABOUT US
            </Link>
          </>
        }
      />
    </>
  )
}
