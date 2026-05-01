"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { MobileNav } from "@/components/mobile-nav"
import { NsmHomeCorner } from "@/components/nsm-home-corner"

const navItems = [
  { href: "/ndb", label: "nDB", external: false },
  { href: "http://snparchitecture.com/", label: "SNP", external: true },
  { href: "/metalogic", label: "+META LOGIC", external: false },
  { href: "/about", label: "ABOUT US", external: false },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const headerRef = useRef<HTMLElement>(null)
  const mountedPathname = useRef(pathname)
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

  // Anchor header to visual viewport so it stays the same size and on-screen
  // when the user pinch-zooms (counter-scales and counter-translates the pinch).
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      el.style.transformOrigin = '0 0'
      el.style.transform = `translate(${vv.offsetLeft}px, ${vv.offsetTop}px) scale(${1 / vv.scale})`
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 w-full z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {mountedPathname.current !== "/" && <NsmHomeCorner />}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <div className="flex items-center text-xl font-bold tracking-tight">
              <Link href="/ndb" className="text-foreground hover:opacity-60 transition-opacity">N</Link>
              <span className="text-muted-foreground">+</span>
              <a href="http://snparchitecture.com/" target="_blank" rel="noreferrer" className="text-foreground hover:opacity-60 transition-opacity">S</a>
              <span className="text-muted-foreground">+</span>
              <Link href="/metalogic" className="text-foreground hover:opacity-60 transition-opacity">M</Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-foreground",
                      mountedPathname.current === "/snp" ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-foreground",
                      mountedPathname.current === item.href ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

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
      </header>

      <MobileNav
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentBrand="N"
        subMenu={
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ABOUT US
          </Link>
        }
      />
    </>
  )
}
