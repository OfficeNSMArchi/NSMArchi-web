"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useLanguage } from "@/lib/language-context"

export default function AboutPage() {
  const { t } = useLanguage()
  const panelId = useId()
  const [openKey, setOpenKey] = useState<"ndb" | "snp" | "ml" | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql =
      typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)") : null

    if (!mql) return

    const onChange = () => setIsDesktop(mql.matches)
    onChange()

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    }

    // Safari fallback
    // @ts-expect-error - older MediaQueryList API
    mql.addListener(onChange)
    // @ts-expect-error - older MediaQueryList API
    return () => mql.removeListener(onChange)
  }, [])

  const companies = useMemo(
    () =>
      [
        {
          key: "ndb" as const,
          alt: "NDB",
          src: "/branding/ndb-v.svg",
          historyHeading: {
            ko: "엔디비 건축사사무소",
            en: "NDB Architecture Office",
          },
          capabilities: [
            {
              ko: "기본설계 및 인허가 전략 수립",
              en: "Schematic design & permitting strategy development",
            },
            {
              ko: "디자인 고도화 및 실시설계",
              en: "Design refinement & construction documents",
            },
            { ko: "BIM 엔지니어링 및 컨설팅", en: "BIM engineering & consulting" },
            {
              ko: "신기술 연구 및 신사업 개발",
              en: "Emerging technology research & new business development",
            },
          ],
          historySections: {
            profile: [
              { ko: "김상환", en: "Sanghwan Kim" },
              { ko: "건축사 (KIRA)", en: "Registered Architect (KIRA)" },
            ],
            teaching: [
              {
                ko: "한양대학교 ERICA 겸임교수",
                en: "Adjunct Professor, Hanyang University ERICA",
              },
              {
                ko: "전) 경기주택도시공사 기술자문위원(건축BIM)",
                en: "Former Technical Advisory Committee Member (Architecture/BIM), GH",
              },
            ],
            education: [
              {
                ko: "한양대학교 대학원 건축공학과, 서울",
                en: "M.S., Architectural Engineering, Hanyang Univ. (Seoul)",
              },
              { ko: "한양대학교 건축학과, 서울", en: "B.Arch, Hanyang Univ. (Seoul)" },
            ],
            experience: [
              { ko: "(주)해안종합건축사사무소", en: "Haeahn Architecture" },
              { ko: "(주)희림종합건축사사무소", en: "Heerim Architects & Planners" },
            ],
            projects: [
              { ko: "카타르 루사일 플라자 타워", en: "Lusail Plaza Towers (Qatar)" },
              {
                ko: "삼성전자 평택캠퍼스 사무2동",
                en: "Samsung Electronics Pyeongtaek Campus Office 2",
              },
              { ko: "한국은행 본관 통합별관", en: "Bank of Korea Annex" },
              { ko: "경주 화백컨벤션센터", en: "Gyeongju Hwabaek Convention Center" },
              { ko: "용인시민체육공원", en: "Yongin Citizens Sports Park" },
            ],
          },
        },
        {
          key: "snp" as const,
          alt: "SNP",
          src: "/branding/snp-v.svg",
          historyHeading: { ko: "(주)에스엔피 건축사사무소", en: "SNP Architects" },
          capabilities: [
            { ko: "전략 기획 및 마스터플랜", en: "Strategic planning & masterplanning" },
            {
              ko: "초기 기획 및 개발 가이드라인",
              en: "Early-stage planning & development guidelines",
            },
            { ko: "사업추진 파트너쉽 구축", en: "Partnership building for project delivery" },
            { ko: "사업성 진단 및 기획 설계", en: "Feasibility assessment & concept design" },
          ],
          historySections: {
            profile: [
              { ko: "이상훈", en: "Sanghoon Lee" },
              {
                ko: "건축사 (KIRA), 건축시공기술사",
                en: "Registered Architect (KIRA), Professional Engineer (Construction)",
              },
            ],
            teaching: [],
            education: [
              {
                ko: "충북대학교 건축 공학과",
                en: "Chungbuk National University, Architectural Engineering",
              },
            ],
            experience: [
              { ko: "(주)원도시건축건축사사무소", en: "Wondosi Architects (Co., Ltd.)" },
              { ko: "(주)해안종합건축사사무소", en: "Haeahn Architecture" },
            ],
            projects: [
              {
                ko: "킨텍스 상업시설1 민간사업자공모",
                en: "KINTEX Commercial Facility 1 (private developer RFP)",
              },
              { ko: "삼성테스코 홈플러스", en: "Samsung Tesco Homeplus" },
              { ko: "한림성심대학 증축공사", en: "Hallym Polytechnic University extension" },
              { ko: "퍼시스 본사사옥, 대전센타", en: "Fursys HQ & Daejeon Center" },
              {
                ko: "킨텍스 상업시설2 민간사업자공모",
                en: "KINTEX Commercial Facility 2 (private developer RFP)",
              },
              {
                ko: "한류월드 1,2구역 민간사업자공모",
                en: "Hallyu World Districts 1–2 (private developer RFP)",
              },
              {
                ko: "인천,부천,광주 병영시설 BTL",
                en: "Incheon/Bucheon/Gwangju military facilities BTL",
              },
              { ko: "위례신도시 와이즈더샵 공동주택", en: "Wirye New Town 'Wise The Sharp' housing" },
              {
                ko: "아산시 이순신종합운동장 시설확충 및 종합스포츠센타 신축사업",
                en: "Asan Yi Sun-sin Stadium expansion & sports center new build",
              },
              {
                ko: "광주 신세계 백화점 & 이마트 개발사업",
                en: "Gwangju Shinsegae Dept. Store & E-Mart development",
              },
              { ko: "제주 오라관광단지 조성사업", en: "Jeju Ora tourism complex development" },
              { ko: "인천도화 더샵 공동주택", en: "Incheon Dohwa The Sharp housing" },
              {
                ko: "부산영도 오션시티 푸르지오 공동주택",
                en: "Busan Yeongdo Ocean City Prugio housing",
              },
            ],
          },
        },
        {
          key: "ml" as const,
          alt: "META LOGIC",
          src: "/branding/meta-logic-v.svg",
          historyHeading: { ko: "메타로직 건축연구소", en: "META LOGIC Architecture Lab" },
          capabilities: [
            { ko: "디자인 로직 연구", en: "Design logic research" },
            {
              ko: "설계 프로세스 개발, 교육, 컨설팅",
              en: "Design process development, training & consulting",
            },
            { ko: "해외 사업 네트워킹", en: "International business networking" },
            { ko: "국내 프로젝트 공동 수임, 수행", en: "Joint commission and delivery for domestic projects" },
          ],
          historySections: {
            profile: [
              { ko: "조우성", en: "Woosung Cho" },
              { ko: "외국건축사 (덴마크, MAA), 건축기사", en: "International Architect (Denmark, MAA), Architectural Engineer" },
            ],
            teaching: [
              {
                ko: "한경국립대학교 외래교수",
                en: "Adjunct Professor, Hankyong National University",
              },
              {
                ko: "ERICA (한양대학교) 겸임교수",
                en: "Adjunct Professor, Hanyang University ERICA",
              },
              { ko: "전) 단국대학교 겸임교수", en: "Former Adjunct Professor, Dankook University" },
            ],
            education: [
              {
                ko: "델프트 공대, 도시, 건축, 공학 석사 (ir.)",
                en: "MSc, Urbanism, Architecture & Engineering, TU Delft",
              },
              { ko: "한양대학교 건축학과, 서울", en: "B.Arch, Hanyang University (Seoul)" },
            ],
            experience: [
              { ko: "매스스터디스, 서울", en: "MASS STUDIES, Seoul" },
              { ko: "레오스 디벨롭먼트, 런던", en: "LEOS Developments, London" },
              {
                ko: "(주)선엔지니어링 종합건축사사무소, 청주",
                en: "Sun Engineering Architects (Co., Ltd.), Cheongju",
              },
              { ko: "최페레이라 건축, 서울", en: "Choi+Pereira Architects, Seoul" },
            ],
            projects: [
              { ko: "한남동 근린생활시설", en: "Hannam-dong neighborhood facility" },
              { ko: "CRESTA HOUSE", en: "CRESTA HOUSE" },
              { ko: "부암동 근린생활시설", en: "Buam-dong neighborhood facility" },
              { ko: "주한 프랑스 대사관", en: "Embassy of France in Korea" },
              { ko: "아모레퍼시픽 용인연구소", en: "Amorepacific Yongin R&D Center" },
              { ko: "아모레퍼시픽 도순다원 스파 밸리", en: "Amorepacific Dosundawon Spa Valley" },
              { ko: "현대 글로벌 비즈니스 센터", en: "Hyundai Global Business Center" },
              { ko: "고질라, 이태원 주택", en: "Godzilla, Itaewon House" },
              { ko: "노들섬 오페라 하우스", en: "Nodeul Island Opera House" },
            ],
          },
        },
      ] as const,
    [],
  )

  const maxCounts = useMemo(() => {
    const getLen = (
      c: (typeof companies)[number],
      k: "profile" | "teaching" | "education" | "experience" | "projects",
    ) => c.historySections[k].length
    return {
      profile: Math.max(...companies.map((c) => getLen(c, "profile"))),
      teaching: Math.max(...companies.map((c) => getLen(c, "teaching"))),
      education: Math.max(...companies.map((c) => getLen(c, "education"))),
      experience: Math.max(...companies.map((c) => getLen(c, "experience"))),
      projects: Math.max(...companies.map((c) => getLen(c, "projects"))),
    }
  }, [companies])

  const sectionMinHeights = useMemo(() => {
    // 12px font, leading-snug ≈ 1.375; (12 * 1.375) = 16.5px/line
    const linePx = 16.5
    // space-y-1.5 = 0.375rem = 6px (Tailwind default 16px/rem)
    const gapPx = 6
    const blockPx = (count: number) => count * linePx + Math.max(0, count - 1) * gapPx
    const atLeastLines = (minLines: number, px: number) => Math.max(px, blockPx(minLines))
    return {
      profile: blockPx(maxCounts.profile),
      // Give teaching a larger base height so layout stays aligned
      teaching: atLeastLines(3, blockPx(maxCounts.teaching)),
      education: blockPx(maxCounts.education),
      experience: blockPx(maxCounts.experience),
      projects: blockPx(maxCounts.projects),
    }
  }, [
    maxCounts.profile,
    maxCounts.teaching,
    maxCounts.education,
    maxCounts.experience,
    maxCounts.projects,
  ])

  const panelMinHeight = useMemo(() => {
    // Keep the three history panels visually aligned by giving them
    // the same minimum height (based on the tallest one).
    const linePx = 16.5
    const gapPx = 6 // space-y-1.5
    const blockPx = (count: number) => count * linePx + Math.max(0, count - 1) * gapPx

    const mt2 = 8
    const mt4 = 16
    const mt6 = 24
    const py3 = 24 // top+bottom padding in px-4 py-3

    const sectionHeight = (itemsPx: number, mt: number) => mt + linePx + mt2 + itemsPx

    const hForCompany = (c: (typeof companies)[number]) => {
      const title = linePx
      const profile = mt2 + sectionMinHeights.profile
      const education = sectionHeight(sectionMinHeights.education, mt4)
      const experience = sectionHeight(sectionMinHeights.experience, mt4)
      const projects = sectionHeight(blockPx(c.historySections.projects.length), mt4)
      const teaching =
        c.key === "snp" ? 0 : sectionHeight(sectionMinHeights.teaching, mt6)

      return py3 + title + profile + education + experience + projects + teaching
    }

    return Math.max(...companies.map(hForCompany))
  }, [companies, sectionMinHeights])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="grid gap-10">
          <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
            {t(
              "기획부터 구현까지, 건축의 전 과정을 함께하는 입체적인 파트너십을 제공합니다.",
              "We provide a multidimensional collaboration partnership across the full architectural journey—from planning to delivery.",
            )}
          </p>

          <div className="grid gap-10 md:grid-cols-3 md:gap-[3.30625rem]">
            {companies.map((c) => {
              const isOpen = isDesktop || openKey === c.key
              const thisPanelId = `${panelId}-${c.key}`

              return (
                <section key={c.key} className="flex flex-col items-center space-y-6 text-center">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={thisPanelId}
                    onClick={() => setOpenKey((prev) => (prev === c.key ? null : c.key))}
                    className="group flex h-[104px] items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-[125px]"
                  >
                    <img
                      src={c.src}
                      alt={c.alt}
                      className="max-h-full w-auto opacity-90"
                    />
                  </button>

                  <ul className="w-full max-w-xs space-y-[0.4rem] text-[13px] leading-[1.3] text-muted-foreground md:min-h-36">
                    {c.capabilities.map((item) => (
                      <li key={item.ko}>{t(item.ko, item.en)}</li>
                    ))}
                  </ul>

                  <div
                    id={thisPanelId}
                    className={[
                      "-mt-6 w-full max-w-xs rounded-md border border-border/50 bg-muted/20 text-left transition-all duration-200",
                      isDesktop
                        ? "max-h-none opacity-100"
                        : isOpen
                          ? "max-h-[70vh] overflow-hidden opacity-100"
                          : "max-h-0 overflow-hidden border-transparent opacity-0",
                    ].join(" ")}
                    style={isDesktop ? { minHeight: panelMinHeight } : undefined}
                  >
                    <div className="px-4 py-3">
                      <p className="text-xs font-medium tracking-wide text-foreground/80">
                        {t(c.historyHeading.ko, c.historyHeading.en)}
                      </p>
                      <ul
                        className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground"
                        style={{ minHeight: sectionMinHeights.profile }}
                      >
                        {c.historySections.profile.map((h) => (
                          <li key={h.ko}>{t(h.ko, h.en)}</li>
                        ))}
                      </ul>

                      <div className="mt-4">
                        <p className="text-[12px] font-medium leading-snug text-foreground/80">
                          {t("학위", "Education")}
                        </p>
                        <ul
                          className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground"
                          style={{ minHeight: sectionMinHeights.education }}
                        >
                          {c.historySections.education.map((h) => (
                            <li key={h.ko}>{t(h.ko, h.en)}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        <p className="text-[12px] font-medium leading-snug text-foreground/80">
                          {t("실무 경력", "Experience")}
                        </p>
                        <ul
                          className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground"
                          style={{ minHeight: sectionMinHeights.experience }}
                        >
                          {c.historySections.experience.map((h) => (
                            <li key={h.ko}>{t(h.ko, h.en)}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        <p className="text-[12px] font-medium leading-snug text-foreground/80">
                          {t("주요 참여 프로젝트", "Selected projects")}
                        </p>
                        <ul
                          className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground"
                        >
                          {c.historySections.projects.map((h) => (
                            <li key={h.ko}>{t(h.ko, h.en)}</li>
                          ))}
                        </ul>
                      </div>

                      {c.key !== "snp" && (
                        <div className="mt-6">
                          <p className="text-[12px] font-medium leading-snug text-foreground/80">
                          {t("강의", "Teaching")}
                          </p>
                          <ul
                            className="mt-2 space-y-1.5 text-[12px] leading-snug text-muted-foreground"
                            style={{ minHeight: sectionMinHeights.teaching }}
                          >
                            {c.historySections.teaching.map((h) => (
                              <li key={h.ko}>{t(h.ko, h.en)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )
                })}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

