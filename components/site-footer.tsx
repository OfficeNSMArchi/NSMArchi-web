import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-bold text-foreground">
              N/S/M
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              {t(
                "NDB, SNP, META LOGIC의 협력체로서 도시와 건축의 미래를 함께 만들어갑니다.",
                "As a collaboration between NDB, SNP, and META LOGIC, we shape the future of cities and architecture together.",
              )}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              {t("Companies", "Companies")}
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/ndb"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  NDB Architecture
                </Link>
              </li>
              <li>
                <Link
                  href="/snp"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  SNP Design Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/metalogic"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  META LOGIC Engineering
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              {t("Contact", "Contact")}
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Seoul, Korea</li>
              <li>contact@nsm.kr</li>
              <li>+82 2 1234 5678</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            2026 N/S/M. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
