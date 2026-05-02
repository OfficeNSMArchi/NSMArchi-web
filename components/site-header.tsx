"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import React from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { LAYOUT_MAX_W, LAYOUT_PX } from "@/lib/layout"
import { useViewMode } from "@/lib/view-mode-context"
import { Grid2X2, List } from "lucide-react"

interface SiteHeaderProps {
  brandButton?: React.ReactNode
  slideContent?: (onClose: () => void) => React.ReactNode
  dropdownItems?: (onClose: () => void) => React.ReactNode
}

export function SiteHeader({ brandButton, slideContent, dropdownItems }: SiteHeaderProps = {}) {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const headerRef = useRef<HTMLElement>(null)
  const mountedPathname = useRef(pathname)
  const isHome = mountedPathname.current === "/"
  const [brandOpen, setBrandOpen] = useState(isHome)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverEnabled = useRef(true)
  const startClose = () => { closeTimer.current = setTimeout(() => setBrandOpen(false), 150) }
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current) }
  const handleNsmClick = () => {
    if (brandOpen) {
      hoverEnabled.current = false
      setBrandOpen(false)
      setTimeout(() => { hoverEnabled.current = true }, 300)
    } else {
      setBrandOpen(true)
    }
  }
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { viewMode, setViewMode } = useViewMode()

  useEffect(() => {
    if (isHome) {
      const t = setTimeout(() => setBrandOpen(false), 2000)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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


  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!brandOpen) return
    const handler = (e: MouseEvent) => {
      const outsideHeader = headerRef.current && !headerRef.current.contains(e.target as Node)
      const outsideDropdown = dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      if (outsideHeader && outsideDropdown) setBrandOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [brandOpen])

  return (
    <>
      <header ref={headerRef} data-exclude-pin className="fixed top-0 left-0 right-0 w-full z-50 border-b border-border bg-background">
        <div className={`mx-auto flex h-12 items-center justify-between ${LAYOUT_MAX_W} ${LAYOUT_PX}`}>

          {/* 왼쪽: N+S+M + 브랜드 로고 슬라이드 */}
          <div className="flex items-center gap-3" onMouseEnter={cancelClose} onMouseLeave={startClose}>
            <div className="relative w-fit" onMouseEnter={() => { if (!hoverEnabled.current) return; cancelClose(); setBrandOpen(true) }}>
            <button
              onClick={handleNsmClick}
              className="flex items-center text-xl font-bold tracking-tight shrink-0"
              aria-label="브랜드 메뉴"
            >
              {brandButton ?? (
                <>
                  <span className="text-foreground hover:opacity-60 transition-opacity" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '0s' }}>N</span>
                  <span className="text-foreground" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '1s' }}>+</span>
                  <span className="text-foreground hover:opacity-60 transition-opacity" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '2s' }}>S</span>
                  <span className="text-muted-foreground" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '3s' }}>+</span>
                  <span className="text-foreground hover:opacity-60 transition-opacity" style={{ animation: 'nsm-wave 5s ease-in-out infinite', animationDelay: '4s' }}>M</span>
                </>
              )}
            </button>
            </div>{/* /relative */}

            {/* 슬라이드 콘텐츠 */}
            <div
              className="flex items-center gap-5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ maxWidth: brandOpen ? '400px' : '0px', opacity: brandOpen ? 1 : 0 }}
            >
              {slideContent ? slideContent(() => setBrandOpen(false)) : (
                <>
                  <Link href="/ndb" onClick={() => setBrandOpen(false)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                    <img src="/branding/ndb-v.svg" alt="NDB" className="h-8 w-auto brightness-0" />
                  </Link>
                  <a href="http://snparchitecture.com/" target="_blank" rel="noreferrer" onClick={() => setBrandOpen(false)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                    <img src="/branding/snp-v.svg" alt="SNP" className="h-8 w-auto brightness-0" />
                  </a>
                  <Link href="/metalogic" onClick={() => setBrandOpen(false)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                    <img src="/branding/meta-logic-v.svg" alt="META LOGIC" className="h-8 w-auto brightness-0" />
                  </Link>
                </>
              )}
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

      {/* 드롭다운 — 헤더 바깥 fixed, z-40으로 헤더 뒤에 위치 */}
      <div
        ref={dropdownRef}
        data-exclude-pin
        onMouseEnter={() => { cancelClose(); setBrandOpen(true) }}
        onMouseLeave={startClose}
        className={cn(
          "fixed left-0 right-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          brandOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1"
        )}
        style={{ top: 'var(--header-h, 48px)' }}
      >
        <div className={`mx-auto ${LAYOUT_MAX_W} ${LAYOUT_PX}`}>
        <div className="w-fit pb-4 pl-1 pr-4 bg-background/20 backdrop-blur-md">
        <div className="w-max flex flex-col gap-1 items-start pt-1.5 border-l border-border pl-2" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.6)' }}>
          {dropdownItems ? dropdownItems(() => setBrandOpen(false)) : (
            <>
              <Link
                href="/"
                onClick={() => setBrandOpen(false)}
                className="text-[10px] font-medium text-foreground hover:opacity-60 transition-opacity"
              >
                ALL
              </Link>
              {["RESIDENTIAL", "COMMERCIAL", "PUBLIC"].map(label => (
                <span key={label} className="text-[10px] font-medium text-foreground cursor-default">{label}</span>
              ))}
              <Link
                href="/about"
                onClick={() => setBrandOpen(false)}
                className="text-[10px] font-medium text-foreground hover:opacity-60 transition-opacity"
              >
                ABOUT US
              </Link>
            </>
          )}
          <div className="flex items-center gap-1 pt-1 pb-0 border-t border-border leading-none">
            <button
              onClick={() => { setLanguage("ko"); setBrandOpen(false) }}
              className={cn("text-[9px] font-medium text-foreground transition-opacity",
                language === "ko" ? "opacity-100" : "opacity-40 hover:opacity-70"
              )}
            >
              KOR
            </button>
            <span className="text-foreground opacity-40 text-[9px]">/</span>
            <button
              onClick={() => { setLanguage("en"); setBrandOpen(false) }}
              className={cn("text-[9px] font-medium text-foreground transition-opacity",
                language === "en" ? "opacity-100" : "opacity-40 hover:opacity-70"
              )}
            >
              ENG
            </button>
          </div>
        </div>
        </div>
        </div>
      </div>
    </>
  )
}
