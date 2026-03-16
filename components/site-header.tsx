"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { NDBModal } from "@/components/ndb-modal"

const navItems = [
  { href: "/ndb", label: "NDB", external: false, opensModal: true },
  {
    href: "http://snparchitecture.com/",
    label: "SNP",
    external: true,
  },
  { href: "/metalogic", label: "META LOGIC", external: false, opensModal: false },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [ndbOpen, setNdbOpen] = useState(false)
  const { language, setLanguage } = useLanguage()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          N/S/M
        </Link>
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-8">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    pathname === "/snp"
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </a>
              ) : item.opensModal ? (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setNdbOpen(true)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    ndbOpen || pathname === "/ndb"
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          
          {/* Language Toggle */}
          <div className="flex items-center gap-1 border-l border-border pl-6">
            <button
              onClick={() => setLanguage("ko")}
              className={cn(
                "px-2 py-1 text-xs font-medium transition-colors",
                language === "ko"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              ENG
            </button>
          </div>
        </div>
      </div>
      <NDBModal open={ndbOpen} onClose={() => setNdbOpen(false)} />
    </header>
  )
}
