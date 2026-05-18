import { ProjectFormData } from "./generateMdx";
import { Project } from "@/types/project";
import { getUseTypeLabel } from "./useTypeSchema";
import { deriveStatus, type StageType } from "./stageSchema";

export function formToProject(data: ProjectFormData, blobUrls: Map<string, string>): Project {
  const id = data.id || "preview";
  const resolve = (src: string) => {
    if (!src) return src;
    if (blobUrls.has(src)) return blobUrls.get(src)!;
    if (src.startsWith('/') || src.startsWith('blob:') || src.startsWith('http')) return src;
    return `/projects/${id}/${src}`;
  };

  return {
    id: data.id || "preview",
    title: data.title || "Untitled",
    titleKo: data.titleKo || "제목 없음",
    location: data.location || "-",
    locationKo: data.locationKo || "-",
    year: data.year,
    stageType: data.stageType || undefined,
    stage: data.stage !== "" ? Number(data.stage) : undefined,
    status: data.stageType && data.stage !== ""
      ? deriveStatus(data.stageType as StageType, Number(data.stage))
      : "planning",
    client: data.client || "-",
    clientKo: data.clientKo || "-",
    area: data.area || "-",
    useType: data.useType || undefined,
    use: data.useType ? getUseTypeLabel(data.useType, "en") : "-",
    useKo: data.useType ? getUseTypeLabel(data.useType, "ko") : "-",
    description: data.description || "To be updated",
    descriptionKo: data.descriptionKo || "To be updated",
    companies: data.companies,
    metalogicCategory: data.metalogicCategory || undefined,
    ndbCategory: data.ndbCategory || undefined,
    snpCategory: data.snpCategory || undefined,
    visibleOn: data.visibleOn,
    image: resolve(data.coverImage),
    images: data.images.map(resolve),
    content: data.content.map((block) => {
      if (block.type === "image") {
        return { type: "image" as const, src: resolve(block.src ?? ""), alt: block.alt };
      }
      if (block.type === "map") {
        return { type: "map" as const, address: block.address, lat: block.lat, lng: block.lng, zoom: block.zoom, mapType: block.mapType };
      }
      return {
        type: "text" as const,
        title: { ko: block.titleKo ?? "", en: block.titleEn ?? "" },
        body: { ko: block.bodyKo ?? "", en: block.bodyEn ?? "" },
      };
    }),
  };
}
