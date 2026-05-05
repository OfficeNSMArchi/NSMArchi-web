import { NdbCategoryProvider } from '@/components/ndb-category-provider';
import { allProjects } from "@/data/projects/index"
import { NdbContent } from "./ndb-content"

const ndbProjects = allProjects.filter(p => p.companies.includes("ndb"))

export default function Page() {
  return (
    <NdbCategoryProvider>
      <NdbContent ndbProjects={ndbProjects} />
    </NdbCategoryProvider>
  )
}
