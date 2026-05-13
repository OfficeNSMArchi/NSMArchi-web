// types/project.ts

export interface Project {
    id: string;
    title: string;
    titleKo: string;
    location: string;
    locationKo: string;
    year: string;
    status: "completed" | "in-progress" | "planning";
    stageType?: "project" | "research" | "software";
    stage?: number;
    client: string;
    clientKo: string;
    area: string;
    useType?: string;
    use: string;
    useKo: string;
    image: string;
    images?: string[];
    description: string;
    descriptionKo: string;
    content?: Array<
      | { type: "image"; src: string; alt?: string; }
      | { type: "text"; title?: { ko: string; en: string }; body: { ko: string; en: string }; }
    >;
    companies: Array<"ndb" | "snp" | "metalogic">;
    metalogicCategory?: "practice" | "research" | "solution" | "essay" | "education" | "roots";
    ndbCategory?: "project" | "research";
    snpCategory?: "project" | "research";
    visibleOn?: string[];
  }