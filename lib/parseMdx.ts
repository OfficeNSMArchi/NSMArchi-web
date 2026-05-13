import matter from "gray-matter";
import { ProjectFormData, ContentBlock, defaultFormData } from "./generateMdx";
import { KNOWN_FIELDS } from "./fieldSchema";

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

  const extraFields: Record<string, string> = {};
  Object.keys(data).forEach((key) => {
    if (!KNOWN_FIELDS.has(key)) {
      extraFields[key] = String(data[key] ?? "");
    }
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
    useType: data.useType ?? "",
    companies: Array.isArray(data.companies) ? data.companies : [],
    metalogicCategory: data.metalogicCategory ?? "",
    ndbCategory: data.ndbCategory ?? "",
    snpCategory: data.snpCategory ?? "",
    featured: data.featured ?? false,
    showOnHome: data.showOnHome ?? false,
    coverImage: data.coverImage ?? "",
    images: Array.isArray(data.images) ? data.images : [],
    description: data.description ?? "",
    descriptionKo: data.descriptionKo ?? "",
    content,
    extraFields,
  };
}
