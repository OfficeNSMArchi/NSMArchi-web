"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { useNsmCategory, type NsmSortKey } from "@/components/nsm-category-provider"

const SORT_ITEMS: { key: NsmSortKey; label: string }[] = [
  { key: "default",  label: "ALL" },
  { key: "byUse",   label: "BY USE" },
  { key: "bySize",  label: "BY SIZE" },
  { key: "byYear",  label: "BY YEAR" },
]

export function NsmSiteHeader() {
  const { sortKey, setSortKey } = useNsmCategory()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <SiteHeader
      dropdownItems={(onClose) => (
        <>
          {SORT_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (pathname !== "/") { router.push("/"); onClose(); return }
                  setSortKey(item.key); onClose()
                }}
                className={cn(
                  "text-[10px] font-medium text-foreground transition-opacity",
                  sortKey === item.key ? "opacity-100" : "opacity-40 hover:opacity-70"
                )}
              >
                {item.label}
              </button>
              {item.key === "default" && (
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
