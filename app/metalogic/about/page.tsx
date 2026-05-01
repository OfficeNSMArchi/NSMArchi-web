"use client"

import { MetalogicHeader } from "@/components/metalogic-header"
import { SiteFooter } from "@/components/site-footer"
import { useLanguage } from "@/lib/language-context"
import { metalogicAboutData } from "@/lib/metalogic-about-data"

export default function MetalogicAboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-h, 109px)' }}>
      <MetalogicHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="grid gap-10">
          <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
            {t(metalogicAboutData.intro.ko, metalogicAboutData.intro.en)}
          </p>

          <section className="mx-auto w-full max-w-xs text-center">
            <img
              src="/branding/meta-logic-v.svg"
              alt="META LOGIC"
              className="mx-auto h-[110px] w-auto opacity-90 md:h-[125px]"
            />

            <div className="mt-6 rounded-md border border-border/50 bg-muted/20 text-left">
              <div className="px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-foreground/80">
                  {t(metalogicAboutData.historyHeading.ko, metalogicAboutData.historyHeading.en)}
                </p>

                <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground">
                  {metalogicAboutData.historySections.profile.map((item) => (
                    <li key={item.ko}>{t(item.ko, item.en)}</li>
                  ))}
                </ul>

                <div className="mt-4">
                  <p className="text-[12px] font-medium leading-snug text-foreground/80">
                    {t("학위", "Education")}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground">
                    {metalogicAboutData.historySections.education.map((item) => (
                      <li key={item.ko}>{t(item.ko, item.en)}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-[12px] font-medium leading-snug text-foreground/80">
                    {t("실무 경력", "Experience")}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground">
                    {metalogicAboutData.historySections.experience.map((item) => (
                      <li key={item.ko}>{t(item.ko, item.en)}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-[12px] font-medium leading-snug text-foreground/80">
                    {t("주요 참여 프로젝트", "Selected projects")}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground">
                    {metalogicAboutData.historySections.projects.map((item) => (
                      <li key={item.ko}>{t(item.ko, item.en)}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <p className="text-[12px] font-medium leading-snug text-foreground/80">
                    {t("강의", "Teaching")}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground">
                    {metalogicAboutData.historySections.teaching.map((item) => (
                      <li key={item.ko}>{t(item.ko, item.en)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
