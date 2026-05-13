import { NdbCategoryProvider } from '@/components/ndb-category-provider';
import { allProjects } from "@/data/projects/index"
import { NdbContent } from "./ndb-content"
import { isVisibleOn } from "@/lib/projectUtils"

const ndbProjects = allProjects.filter(p => isVisibleOn(p, "ndb"))

export default function Page() {
  return (
    <NdbCategoryProvider>
      <NdbContent ndbProjects={ndbProjects} />
    </NdbCategoryProvider>
  )
}
