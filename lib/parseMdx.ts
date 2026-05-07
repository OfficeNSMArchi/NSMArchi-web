import matter from "gray-matter";
import { ProjectFormData, ContentBlock, defaultFormData } from "./generateMdx";

export function parseMdx(mdxString: string): ProjectFormData {
  const { data } = matter(mdxString);

  const content: ContentBlock[] = (data.content ?? []).map((block: Record<string, string>) => {
    if (block.type === "image") {
      return { type: "image" as const, src: block.src ?? "", alt: block.alt ?? "" };
    }
    return {
      type: "text" as const,
      titleKo: block.titleKo ?? "",
      titleEn: block.titleEn ?? "",
      bodyKo: block.bodyKo ?? "",
      bodyEn: block.bodyEn ?? "",
    };
  });

  return {
    ...defaultFormData,
    id: data.id ?? "",
    title: data.title ?? "",
    titleKo: data.titleKo ?? "",
    location: data.location ?? "",
    locationKo: data.locationKo ?? "",
    year: data.year ? String(data.year) : new Date().getFullYear().toString(),
    status: data.status ?? "planning",
    client: data.client ?? "",
    clientKo: data.clientKo ?? "",
    area: data.area ?? "-",
    use: data.use ?? "-",
    useKo: data.useKo ?? "-",
    category: data.category ?? "",
    companies: Array.isArray(data.companies) ? data.companies : [],
    metalogicCategory: data.metalogicCategory ?? "",
    featured: data.featured ?? false,
    showOnHome: data.showOnHome ?? false,
    coverImage: data.coverImage ?? "",
    images: Array.isArray(data.images) ? data.images : [],
    description: data.description ?? "",
    descriptionKo: data.descriptionKo ?? "",
    content,
  };
}
