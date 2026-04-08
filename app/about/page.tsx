"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useLanguage } from "@/lib/language-context"

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {t("소개", "About")}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {t("N/S/M", "N/S/M")}
        </h1>

        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
          {t(
            "N/S/M은 NDB, SNP, META LOGIC의 협력체로서 도시와 건축의 미래를 함께 만들어갑니다.",
            "N/S/M is a collaboration between NDB, SNP, and META LOGIC, shaping the future of cities and architecture together.",
          )}
        </p>

        <div className="mt-10 grid gap-4 rounded-xl border border-border bg-muted/20 p-6">
          <div className="flex flex-wrap gap-2">
            {["NDB", "SNP", "META LOGIC"].map((name) => (
              <span
                key={name}
                className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "각 파트너의 전문성(설계/기술/엔지니어링)을 결합해 프로젝트의 초기 기획부터 구현까지 일관된 품질을 제공합니다.",
              "We combine each partner’s expertise (design, technology, engineering) to deliver consistent quality from early concept to execution.",
            )}
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

