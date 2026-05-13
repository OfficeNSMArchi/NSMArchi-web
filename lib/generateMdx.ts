export interface ContentBlock {
  type: "image" | "text";
  // image
  src?: string;
  alt?: string;
  // text
  titleKo?: string;
  titleEn?: string;
  bodyKo?: string;
  bodyEn?: string;
}

export interface ProjectFormData {
  id: string;
  title: string;
  titleKo: string;
  location: string;
  locationKo: string;
  year: string;
  status: "completed" | "in-progress" | "planning";
  client: string;
  clientKo: string;
  area: string;
  use: string;
  useKo: string;
  category: "design" | "research" | "";
  companies: Array<"ndb" | "snp" | "metalogic">;
  metalogicCategory: "practice" | "concept" | "research" | "academic" | "";
  featured: boolean;
  showOnHome: boolean;
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
  year: new Date().getFullYear().toString(),
  status: "planning",
  client: "",
  clientKo: "",
  area: "-",
  use: "-",
  useKo: "-",
  category: "",
  companies: [],
  metalogicCategory: "",
  featured: false,
  showOnHome: false,
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
  lines.push(`status: ${data.status}`);
  lines.push(`client: ${escapeYamlString(data.client)}`);
  lines.push(`clientKo: ${escapeYamlString(data.clientKo)}`);
  lines.push(`area: ${escapeYamlString(data.area || "-")}`);
  lines.push(`use: ${escapeYamlString(data.use || "-")}`);
  lines.push(`useKo: ${escapeYamlString(data.useKo || "-")}`);

  if (data.category) {
    lines.push(`category: ${data.category}`);
  }

  if (data.companies.length > 0) {
    lines.push(`companies: [${data.companies.join(", ")}]`);
  }

  if (data.metalogicCategory) {
    lines.push(`metalogicCategory: ${data.metalogicCategory}`);
  }

  if (data.featured) lines.push(`featured: true`);
  if (data.showOnHome) lines.push(`showOnHome: true`);

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
