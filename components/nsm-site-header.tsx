"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { useNsmCategory, type NsmCategoryKey } from "@/components/nsm-category-provider"

const categories: { key: NsmCategoryKey; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "residential", label: "RESIDENTIAL" },
  { key: "commercial", label: "COMMERCIAL" },
  { key: "public", label: "PUBLIC" },
]

export function NsmSiteHeader() {
  const { selectedCategory, setSelectedCategory } = useNsmCategory()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <SiteHeader
      dropdownItems={(onClose) => (
        <>
          {categories.map((cat) => (
            <div key={cat.key} className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (pathname !== "/") { router.push("/"); onClose(); return }
                  setSelectedCategory(cat.key); onClose()
                }}
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
