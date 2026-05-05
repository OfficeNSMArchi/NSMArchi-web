import { MetalogicSiteHeader } from "@/components/metalogic-site-header"
import { SiteFooter } from "@/components/site-footer"
import { allProjects } from "@/data/projects/index"
import { MetalogicContent } from "./metalogic-content"

const hiddenOnMetaLogicPage = new Set<string>(["ml-factory", "nsm-resort"])
const metalogicProjects = allProjects.filter(
  (p) => p.companies.includes("metalogic") && !hiddenOnMetaLogicPage.has(p.id),
)

export default function MetaLogicPage() {
  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--header-h, 48px)' }}>
      <MetalogicSiteHeader />
      <main>
        <section className="py-8 md:py-12">
          <MetalogicContent projects={metalogicProjects} />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
