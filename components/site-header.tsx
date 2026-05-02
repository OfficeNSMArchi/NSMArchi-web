"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { NsmHomeCorner } from "@/components/nsm-home-corner"
import { LAYOUT_MAX_W, LAYOUT_PX } from "@/lib/layout"
import { useViewMode } from "@/lib/view-mode-context"
import { Grid2X2, List } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const headerRef = useRef<HTMLElement>(null)
  const mountedPathname = useRef(pathname)
  const [brandOpen, setBrandOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownRight, setDropdownRight] = useState(0)
  const { viewMode, setViewMode } = useViewMode()
  const isHome = mountedPathname.current === "/"

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handler = () => setBrandOpen(false)
    window.addEventListener('orientationchange', handler)
    return () => window.removeEventListener('orientationchange', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setBrandOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!brandOpen || !dropdownRef.current) return
    const rect = dropdownRef.current.getBoundingClientRect()
    setDropdownRight(rect.right)
  }, [brandOpen])

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!brandOpen) return
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setBrandOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [brandOpen])

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 w-full z-50 border-b border-border bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        {mountedPathname.current !== "/" && <NsmHomeCorner />}
        <div className={`mx-auto flex h-12 items-center justify-between ${LAYOUT_MAX_W} ${LAYOUT_PX}`}>

          {/* 왼쪽: N+S+M + 브랜드 로고 슬라이드 */}
          <div className="flex items-center gap-6">
            <div className="relative w-fit">
            <button
              onClick={() => setBrandOpen(v => !v)}
              className="flex items-center text-xl font-bold tracking-tight shrink-0"
              aria-label="브랜드 메뉴"
            >
              <span className="text-foreground hover:opacity-60 transition-opacity" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '0s' }}>N</span>
              <span className="text-foreground" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '1s' }}>+</span>
              <span className="text-foreground hover:opacity-60 transition-opacity" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '2s' }}>S</span>
              <span className="text-muted-foreground" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '3s' }}>+</span>
              <span className="text-foreground hover:opacity-60 transition-opacity" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '4s' }}>M</span>
            </button>

            {/* 드롭다운 — N+S+M 아래, 내용 크기만큼, 블러 */}
            <div
              ref={dropdownRef}
              className={cn(
                "absolute top-full left-0 mt-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                brandOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1"
              )}
            >
              <div className="w-max flex flex-col gap-1 items-center px-0 py-1.5">
                <Link
                  href="/about"
                  onClick={() => setBrandOpen(false)}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  ABOUT US
                </Link>
                <div className="flex items-center gap-1 pt-1 border-t border-border">
                  <button
                    onClick={() => { setLanguage("ko"); setBrandOpen(false) }}
                    className={cn("text-[9px] font-medium transition-colors",
                      language === "ko" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    KOR
                  </button>
                  <span className="text-muted-foreground text-[9px]">/</span>
                  <button
                    onClick={() => { setLanguage("en"); setBrandOpen(false) }}
                    className={cn("text-[9px] font-medium transition-colors",
                      language === "en" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    ENG
                  </button>
                </div>
              </div>
            </div>

            </div>{/* /relative */}

            {/* 브랜드 로고 — 오른쪽으로 슬라이드 */}
            <div
              className="flex items-center gap-5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ maxWidth: brandOpen ? '400px' : '0px', opacity: brandOpen ? 1 : 0 }}
            >
              <Link href="/ndb" onClick={() => setBrandOpen(false)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <img src="/branding/ndb-v.svg" alt="NDB" className="h-8 w-auto brightness-0" />
              </Link>
              <a href="http://snparchitecture.com/" target="_blank" rel="noreferrer" onClick={() => setBrandOpen(false)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <img src="/branding/snp-v.svg" alt="SNP" className="h-8 w-auto brightness-0" />
              </a>
              <Link href="/metalogic" onClick={() => setBrandOpen(false)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <img src="/branding/meta-logic-v.svg" alt="META LOGIC" className="h-8 w-auto brightness-0" />
              </Link>
            </div>
          </div>

          {/* 오른쪽 — 모바일 전용 뷰 토글 */}
          {isHome && (
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="뷰 전환"
            >
              {viewMode === 'list' ? <Grid2X2 size={18} /> : <List size={18} />}
            </button>
          )}
        </div>

      </header>
      {/* 드롭다운 배경 — left:0 ~ 드롭다운 오른쪽 끝, 헤더 하단 ~ 화면 하단 */}
      <div
        className="fixed left-0 bottom-0 z-30 bg-background/70 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
        style={{
          top: 'var(--header-h, 48px)',
          width: brandOpen ? dropdownRight + 25 : 0,
          opacity: brandOpen ? 1 : 0,
        }}
      />
    </>
  )
}
