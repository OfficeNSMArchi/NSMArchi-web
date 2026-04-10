import type { ReactNode } from "react"
import { MetalogicCategoryProvider } from "@/components/metalogic-category-provider"

export default function MetalogicLayout({ children }: { children: ReactNode }) {
  return <MetalogicCategoryProvider>{children}</MetalogicCategoryProvider>
}
