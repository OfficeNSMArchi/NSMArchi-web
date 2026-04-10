"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import {
  useMetalogicCategory,
  type MetalogicCategoryKey,
} from "@/components/metalogic-category-provider"

const navItems = [
  { href: "/metalogic/about", label: "ABOUT US" },
]

const metalogicCategories: {
  key: MetalogicCategoryKey
  label: string
}[] = [
  { key: "practice", label: "PRACTICE" },
  { key: "concept", label: "CONCEPT" },
  { key: "research", label: "RESEARCH" },
  { key: "academic", label: "ACADEMIC" },
]

export function MetalogicHeader() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const { selectedCategory, setSelectedCategory } = useMetalogicCategory()
  const showCategoryNav = pathname === "/metalogic"

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center">
          <Link href="/metalogic" className="inline-flex items-center">
            <img
              src="/branding/metalogic-title.svg"
              alt="META LOGIC"
              className="h-6 w-auto md:h-7"
            />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pb-3 pt-2 md:pb-3">
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    pathname === item.href ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 border-l border-border pl-6">
              <Link
                href="/"
                className="pr-3 text-sm font-semibold tracking-tight text-foreground"
              >
                N+S+M
              </Link>
              <button
                onClick={() => setLanguage("ko")}
                className={cn(
                  "px-2 py-1 text-xs font-medium transition-colors",
                  language === "ko"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                KOR
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-2 py-1 text-xs font-medium transition-colors",
                  language === "en"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
