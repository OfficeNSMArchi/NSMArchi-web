import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border bg-muted/30 py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-3 md:items-start">
          <div>
            <Link href="/" className="text-xl font-bold text-foreground">
              N+S+M
            </Link>
            <div className="mt-2 flex flex-wrap items-end gap-2 text-sm leading-snug text-muted-foreground">
              <span className="relative -top-8 leading-none">
                Joint Practice KIRA · MAA
              </span>
              <img
                src="/branding/kira-mark.png"
                alt="KIRA"
                className="relative -top-8 h-[2.4rem] w-auto opacity-90"
              />
              <img
                src="/branding/maa-logo-dark.svg"
                alt="MAA"
                className="relative -top-8 h-[2.4rem] w-auto opacity-90"
              />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Address</h4>
            <ul className="relative -top-2 mt-2 space-y-1 text-sm leading-snug text-muted-foreground">
              <li>18, Sapyungdaero, Seocho-gu, Seoul, Korea</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              {t("Contact", "Contact")}
            </h4>
            <ul className="relative -top-2 mt-2 space-y-1 text-sm leading-snug text-muted-foreground">
              <li>Office@NSMarchi.com | +82 2 545 2084</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-center text-sm text-muted-foreground">
            2026 N+S+M. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
