import { ProjectFormData } from "./generateMdx";
import { Project } from "@/types/project";

export function formToProject(data: ProjectFormData, blobUrls: Map<string, string>): Project {
  const resolve = (src: string) => blobUrls.get(src) ?? src;

  return {
    id: data.id || "preview",
    title: data.title || "Untitled",
    titleKo: data.titleKo || "제목 없음",
    category: data.category || undefined,
    location: data.location || "-",
    locationKo: data.locationKo || "-",
    year: data.year,
    status: data.status,
    client: data.client || "-",
    clientKo: data.clientKo || "-",
    area: data.area || "-",
    use: data.use || "-",
    useKo: data.useKo || "-",
    description: data.description || "To be updated",
    descriptionKo: data.descriptionKo || "To be updated",
    companies: data.companies,
    metalogicCategory: data.metalogicCategory || undefined,
    featured: data.featured,
    showOnHome: data.showOnHome,
    image: resolve(data.coverImage),
    images: data.images.map(resolve),
    content: data.content.map((block) => {
      if (block.type === "image") {
        return { type: "image" as const, src: resolve(block.src ?? ""), alt: block.alt };
      }
      return {
        type: "text" as const,
        title: { ko: block.titleKo ?? "", en: block.titleEn ?? "" },
        body: { ko: block.bodyKo ?? "", en: block.bodyEn ?? "" },
      };
    }),
  };
}
