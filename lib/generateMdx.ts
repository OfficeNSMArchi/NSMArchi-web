export interface ContentBlock {
  type: "image" | "text" | "map";
  // image
  src?: string;
  alt?: string;
  // text
  titleKo?: string;
  titleEn?: string;
  bodyKo?: string;
  bodyEn?: string;
  // map
  address?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  mapType?: "roadmap" | "satellite" | "hybrid";
}

export interface ProjectFormData {
  id: string;
  title: string;
  titleKo: string;
  location: string;
  locationKo: string;
  year: string;
  stageType: "design" | "research" | "software" | "";
  stage: number | "";
  client: string;
  clientKo: string;
  area: string;
  useType: import("./useTypeSchema").UseTypeKey;
  companies: Array<"ndb" | "snp" | "metalogic">;
  metalogicCategory: "practice" | "research" | "solution" | "essay" | "education" | "roots" | "";
  ndbCategory: "project" | "research" | "";
  snpCategory: "project" | "research" | "";
  visibleOn: string[];
  coverImage: string;
  images: string[];
  description: string;
  descriptionKo: string;
  content: ContentBlock[];
  extraFields: Record<string, string>;
}

export const defaultFormData: ProjectFormData = {
  id: "",
  title: "",
  titleKo: "",
  location: "",
  locationKo: "",
  year: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  stageType: "design",
  stage: 1,
  client: "",
  clientKo: "",
  area: "-",
  useType: "",
  companies: [],
  metalogicCategory: "",
  ndbCategory: "",
  snpCategory: "",
  visibleOn: [],
  coverImage: "",
  images: [],
  description: "",
  descriptionKo: "",
  content: [],
  extraFields: {},
};

export const REQUIRED_FORM_FIELDS = new Set([
  "id", "title", "titleKo", "location", "locationKo",
  "client", "clientKo", "coverImage", "companies", "description", "descriptionKo",
]);

function escapeYamlString(str: string): string {
  if (!str) return '""';
  if (str.includes('"') || str.includes("'") || str.includes(":") || str.includes("#") || str.includes("\n") || str.startsWith("-") || str.startsWith("*") || str.startsWith("?")) {
    return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return str;
}

function blockScalar(text: string, indent: string): string {
  if (!text) return '""';
  if (!text.includes("\n")) {
    return escapeYamlString(text);
  }
  const lines = text.split("\n").map((l) => `${indent}  ${l}`).join("\n");
  return `|\n${lines}`;
}

export function generateMdx(data: ProjectFormData): string {
  const lines: string[] = ["---"];

  lines.push(`id: ${data.id}`);
  lines.push(`title: ${escapeYamlString(data.title)}`);
  lines.push(`titleKo: ${escapeYamlString(data.titleKo)}`);
  lines.push(`location: ${escapeYamlString(data.location)}`);
  lines.push(`locationKo: ${escapeYamlString(data.locationKo)}`);
  lines.push(`year: "${data.year}"`);
  if (data.stageType) lines.push(`stageType: ${data.stageType}`);
  if (data.stage !== "") lines.push(`stage: ${data.stage}`);
  lines.push(`client: ${escapeYamlString(data.client)}`);
  lines.push(`clientKo: ${escapeYamlString(data.clientKo)}`);
  lines.push(`area: ${escapeYamlString(data.area || "-")}`);

  if (data.useType) {
    lines.push(`useType: ${data.useType}`);
  }

  if (data.companies.length > 0) {
    lines.push(`companies: [${data.companies.join(", ")}]`);
  }

  if (data.metalogicCategory) {
    lines.push(`metalogicCategory: ${data.metalogicCategory}`);
  }

  if (data.ndbCategory) {
    lines.push(`ndbCategory: ${data.ndbCategory}`);
  }

  if (data.snpCategory) {
    lines.push(`snpCategory: ${data.snpCategory}`);
  }

  // visibleOn: brands가 companies와 다르거나 nsm 포함 시 출력
  const companiesSet = new Set(data.companies)
  const nonNsm = data.visibleOn.filter(v => v !== "nsm")
  const brandsDiffer = nonNsm.length !== data.companies.length || nonNsm.some(v => !companiesSet.has(v as any))
  const hasNsm = data.visibleOn.includes("nsm")
  if (brandsDiffer || hasNsm) {
    lines.push(`visibleOn: [${data.visibleOn.join(", ")}]`)
  }

  lines.push(`coverImage: ${data.coverImage || '""'}`);

  if (data.images.filter(Boolean).length > 0) {
    lines.push(`images:`);
    data.images.filter(Boolean).forEach((img) => lines.push(`  - ${img}`));
  }

  lines.push(`description: ${escapeYamlString(data.description || "To be updated")}`);
  lines.push(`descriptionKo: ${escapeYamlString(data.descriptionKo || "To be updated")}`);

  if (data.content.length > 0) {
    lines.push(`content:`);
    data.content.forEach((block) => {
      if (block.type === "image") {
        lines.push(`  - type: image`);
        lines.push(`    src: ${block.src || '""'}`);
        if (block.alt) lines.push(`    alt: ${escapeYamlString(block.alt)}`);
      } else if (block.type === "map") {
        lines.push(`  - type: map`);
        if (block.address) lines.push(`    address: ${escapeYamlString(block.address)}`);
        if (block.lat != null) lines.push(`    lat: ${block.lat}`);
        if (block.lng != null) lines.push(`    lng: ${block.lng}`);
        if (block.zoom != null) lines.push(`    zoom: ${block.zoom}`);
        if (block.mapType && block.mapType !== "roadmap") lines.push(`    mapType: ${block.mapType}`);
      } else {
        lines.push(`  - type: text`);
        lines.push(`    titleKo: ${escapeYamlString(block.titleKo || "-")}`);
        lines.push(`    titleEn: ${escapeYamlString(block.titleEn || "-")}`);
        const bko = blockScalar(block.bodyKo || "", "    ");
        lines.push(`    bodyKo: ${bko}`);
        const ben = blockScalar(block.bodyEn || "", "    ");
        lines.push(`    bodyEn: ${ben}`);
      }
    });
  }

  Object.entries(data.extraFields ?? {}).forEach(([k, v]) => {
    if (k && v !== undefined) lines.push(`${k}: ${escapeYamlString(v)}`);
  });

  lines.push(`---`);
  lines.push(``);

  return lines.join("\n");
}
