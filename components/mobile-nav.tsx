"use client"

import Link from "next/link"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  currentBrand?: "N" | "S" | "M"
  subMenu?: React.ReactNode
}

const brands = [
  { letter: "N", href: "/ndb", external: false },
  { letter: "S", href: "http://snparchitecture.com/", external: true },
  { letter: "M", href: "/metalogic", external: false },
]

export function MobileNav({ isOpen, onClose, currentBrand, subMenu }: MobileNavProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col px-8 pt-24 pb-12 transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {/* N S M */}
      <div className="flex items-end gap-8 mb-4">
        {brands.map(({ letter, href, external }) => {
          const isActive = letter === currentBrand
          const className = cn(
            "text-6xl font-black tracking-tighter transition-colors",
            isActive ? "text-foreground" : "text-muted-foreground/40 hover:text-foreground"
          )
          return external ? (
            <a key={letter} href={href} target="_blank" rel="noreferrer" onClick={onClose} className={className}>
              {letter}
            </a>
          ) : (
            <Link key={letter} href={href} onClick={onClose} className={className}>
              {letter}
            </Link>
          )
        })}
      </div>

      {/* Go to NSM */}
      <Link
        href="/"
        onClick={onClose}
        className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground/50 hover:text-foreground transition-colors mb-6"
      >
        ← N+S+M
      </Link>

      {subMenu && (
        <>
          <div className="border-t border-border mb-8" />
          <div className="flex flex-col gap-4" onClick={onClose}>
            {subMenu}
          </div>
        </>
      )}
    </div>
  )
}
