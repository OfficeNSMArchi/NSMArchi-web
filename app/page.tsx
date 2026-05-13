import { NsmCategoryProvider } from "@/components/nsm-category-provider"
import { allProjects } from "@/data/projects/index"
import { HomeContent } from "./home-content"

const homeProjects = allProjects
  .filter((p) => p.showOnHome)
  .sort((a, b) => Number(b.year) - Number(a.year))

export default function HomePage() {
  return (
    <NsmCategoryProvider>
      <HomeContent projects={homeProjects} />
    </NsmCategoryProvider>
  )
}
