// types/project.ts

export interface Project {
    id: string;
    title: string;
    titleKo: string;
    category?: "design" | "research";
    location: string;
    locationKo: string;
    year: string;
    status: "completed" | "in-progress" | "planning";
    client: string;
    clientKo: string;
    area: string; // 연면적
    use: string; // 용도
    useKo: string; // 용도 한글
    image: string;
    images?: string[];
    description: string;
    descriptionKo: string;
    content?: Array<
      | { type: "image"; src: string; alt?: string }
      | { type: "text"; title?: { ko: string; en: string }; body: { ko: string; en: string } }
    >;
    companies: Array<"ndb" | "snp" | "metalogic">;
    metalogicCategory?: "practice" | "concept" | "research" | "academic";
    featured?: boolean;
    showOnHome?: boolean;
  }