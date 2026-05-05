import { NsmCategoryProvider } from "@/components/nsm-category-provider"
import { allProjects } from "@/data/projects/index"
import { HomeContent } from "./home-content"

const homeProjects = allProjects
  .filter((p) => p.showOnHome)
  .sort((a, b) => {
    const aIsResearch = a.category === "research"
    const bIsResearch = b.category === "research"
    if (aIsResearch !== bIsResearch) return aIsResearch ? 1 : -1
    return Number(b.year) - Number(a.year)
  })

export default function HomePage() {
  return (
    <NsmCategoryProvider>
      <HomeContent projects={homeProjects} />
    </NsmCategoryProvider>
  )
}
