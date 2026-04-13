// data/projects/metalogic/ml-hknu-pavilion.ts
import { Project } from '@/types/project';
import { getImgPath } from '@/lib/utils';

const ID = "ml-hknu-pavilion";

export const mlHknuPavilion: Project = {
  id: ID,
  title: "HKNU PAVILLION",
  titleKo: "HKNU PAVILLION",
  location: "Anseong, Korea",
  locationKo: "안성, 한국",
  year: "2026",
  status: "planning",
  client: "Hankyong National University",
  clientKo: "한경국립대학교",
  area: "-",
  use: "Academic",
  useKo: "교육",
  image: getImgPath(ID, "COVER.jpg"),
  content: [
    { type: "image", src: getImgPath(ID, "F1.jpg"), alt: "Exterior" },
    { type: "image", src: getImgPath(ID, "F2.jpg"), alt: "Facade" },
    {
      type: "text",
      title: { ko: "-", en: "-" },
      body: { ko: "----", en: "----" },
    },
    { type: "image", src: getImgPath(ID, "F3.jpg"), alt: "Interior" },
    {
      type: "text",
      title: { ko: "---", en: "---" },
      body: { ko: "--------", en: "-------" },
    },
    {
      type: "text",
      title: { ko: "------", en: "------" },
      body: { ko: "----------", en: "----------" },
    },
  ],
  description: "To be updated",
  descriptionKo: "To be updated",
  companies: ["metalogic"],
  metalogicCategory: "academic",
};