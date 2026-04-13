// data/projects/metalogic/ml-hknu-fundamental-design.ts
import { Project } from '@/types/project';
import { getImgPath } from '@/lib/utils';

const ID = "ml-hknu-fundamental-design";

export const mlHknuFundamentalDesign: Project = {
  id: ID,
  title: "HKNU FUNDAMENTAL DESIGN",
  titleKo: "HKNU FUNDAMENTAL DESIGN",
  location: "Anseong, Korea",
  locationKo: "안성, 한국",
  year: "2026",
  status: "in-progress",
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