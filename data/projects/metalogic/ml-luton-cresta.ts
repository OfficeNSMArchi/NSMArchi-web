// data/projects/metalogic/ml-luton-cresta.ts
import { Project } from '@/types/project';
import { getImgPath } from '@/lib/utils';

const ID = "ml-luton-cresta";

export const mlLutonCresta: Project = {
  id: ID,
  title: "Luton Cresta House",
  titleKo: "루튼 크레스타 하우스",
  location: "Luton, United Kingdom",
  locationKo: "루튼, 영국",
  year: "2021",
  status: "completed",
  client: "Logistics Koreanp",
  clientKo: "로지스틱스 코리아",
  area: "-",
  use: "-",
  useKo: "-",
  image: getImgPath(ID, "cover.png"),
  description: "To be updated",
  descriptionKo: "To be updated",
  companies: ["metalogic"],
  metalogicCategory: "practice",
  showOnHome: true,
};